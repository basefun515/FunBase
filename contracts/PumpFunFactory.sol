// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IPumpToken {
    function initialize(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator,
        address factory
    ) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PumpFunFactory is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Constants
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant CREATOR_ALLOCATION = 50_000_000 * 10**18; // 5% for creator
    uint256 public constant BONDING_CURVE_ALLOCATION = 950_000_000 * 10**18; // 95% for bonding curve
    uint256 public constant GRADUATION_THRESHOLD = 69_000 * 10**18; // ~$69k market cap
    uint256 public constant MAX_WALLET_PERCENTAGE = 2; // 2% max wallet
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 1; // 1% platform fee
    uint256 public constant MIN_ETH_FOR_GRADUATION = 4 ether; // Min ETH for liquidity
    
    // Base mainnet addresses (update these for testnet)
    address public constant UNISWAP_V2_ROUTER = 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24;
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    
    // State variables
    address public tokenImplementation;
    uint256 public tokenCreationFee = 0.002 ether;
    uint256 public totalTokensCreated;
    uint256 public totalFeesCollected;
    uint256 public totalGraduatedTokens;
    
    mapping(address => TokenInfo) public tokens;
    mapping(address => address[]) public userCreatedTokens;
    mapping(address => bool) public isToken;
    mapping(address => BondingCurve) public bondingCurves;
    mapping(address => bool) public graduated;
    mapping(address => TradingStats) public tradingStats;
    
    // Anti-bot measures
    mapping(address => uint256) public lastTradeTimes;
    mapping(address => uint256) public tradeCounts;
    uint256 public constant ANTI_BOT_DELAY = 3; // 3 seconds between trades
    uint256 public constant MAX_TRADES_PER_HOUR = 100;
    
    struct TokenInfo {
        string name;
        string symbol;
        string description;
        string imageUrl;
        string twitter;
        string telegram;
        string website;
        address creator;
        uint256 createdAt;
        uint256 marketCap;
        bool isGraduated;
    }
    
    struct BondingCurve {
        uint256 ethReserve;
        uint256 tokenReserve;
        uint256 k; // Constant product
        uint256 totalRaised;
        uint256 graduationTarget;
    }
    
    struct TradingStats {
        uint256 totalVolume;
        uint256 buyCount;
        uint256 sellCount;
        uint256 uniqueTraders;
        uint256 highestPrice;
        uint256 lastPrice;
    }
    
    // Events
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );
    
    event TokenPurchased(
        address indexed token,
        address indexed buyer,
        uint256 ethIn,
        uint256 tokensOut,
        uint256 newPrice
    );
    
    event TokenSold(
        address indexed token,
        address indexed seller,
        uint256 tokensIn,
        uint256 ethOut,
        uint256 newPrice
    );
    
    event TokenGraduated(
        address indexed token,
        address indexed lpToken,
        uint256 liquidityAdded,
        uint256 timestamp
    );
    
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    modifier onlyValidToken(address token) {
        require(isToken[token], "Invalid token");
        _;
    }
    
    modifier antiBot(address user) {
        require(
            block.timestamp >= lastTradeTimes[user] + ANTI_BOT_DELAY,
            "Trade too frequent"
        );
        
        // Reset trade count every hour
        if (block.timestamp >= lastTradeTimes[user] + 1 hours) {
            tradeCounts[user] = 0;
        }
        
        require(tradeCounts[user] < MAX_TRADES_PER_HOUR, "Too many trades");
        
        lastTradeTimes[user] = block.timestamp;
        tradeCounts[user]++;
        _;
    }
    
    constructor(address _tokenImplementation) {
        tokenImplementation = _tokenImplementation;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory imageUrl,
        string memory twitter,
        string memory telegram,
        string memory website
    ) external payable whenNotPaused nonReentrant returns (address tokenAddress) {
        require(msg.value >= tokenCreationFee, "Insufficient fee");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "Invalid name/symbol");
        require(bytes(name).length <= 32 && bytes(symbol).length <= 10, "Name/symbol too long");
        
        // Deploy token using minimal proxy pattern
        tokenAddress = _deployToken(name, symbol);
        
        // Initialize token info
        TokenInfo storage info = tokens[tokenAddress];
        info.name = name;
        info.symbol = symbol;
        info.description = description;
        info.imageUrl = imageUrl;
        info.twitter = twitter;
        info.telegram = telegram;
        info.website = website;
        info.creator = msg.sender;
        info.createdAt = block.timestamp;
        
        // Initialize bonding curve
        BondingCurve storage curve = bondingCurves[tokenAddress];
        curve.tokenReserve = BONDING_CURVE_ALLOCATION;
        curve.ethReserve = 0.1 ether; // Virtual liquidity
        curve.k = curve.tokenReserve * curve.ethReserve;
        curve.graduationTarget = GRADUATION_THRESHOLD;
        
        // Track token
        isToken[tokenAddress] = true;
        userCreatedTokens[msg.sender].push(tokenAddress);
        totalTokensCreated++;
        totalFeesCollected += msg.value;
        
        // Transfer creator allocation
        IPumpToken(tokenAddress).transfer(msg.sender, CREATOR_ALLOCATION);
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol, block.timestamp);
        
        return tokenAddress;
    }
    
    function buyToken(address token, uint256 minTokensOut) 
        external 
        payable 
        onlyValidToken(token) 
        nonReentrant 
        antiBot(msg.sender)
        whenNotPaused 
        returns (uint256 tokensOut) 
    {
        require(msg.value > 0, "No ETH sent");
        require(!graduated[token], "Token graduated");
        
        BondingCurve storage curve = bondingCurves[token];
        
        // Calculate tokens out using bonding curve
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 ethIn = msg.value - platformFee;
        
        tokensOut = getTokensOut(ethIn, curve.ethReserve, curve.tokenReserve);
        require(tokensOut >= minTokensOut, "Slippage too high");
        
        // Check max wallet
        uint256 maxWallet = (INITIAL_SUPPLY * MAX_WALLET_PERCENTAGE) / 100;
        require(
            IPumpToken(token).balanceOf(msg.sender) + tokensOut <= maxWallet,
            "Exceeds max wallet"
        );
        
        // Update reserves
        curve.ethReserve += ethIn;
        curve.tokenReserve -= tokensOut;
        curve.totalRaised += ethIn;
        
        // Update stats
        TradingStats storage stats = tradingStats[token];
        stats.totalVolume += msg.value;
        stats.buyCount++;
        uint256 newPrice = getTokenPrice(token);
        stats.lastPrice = newPrice;
        if (newPrice > stats.highestPrice) {
            stats.highestPrice = newPrice;
        }
        
        // Transfer tokens
        IPumpToken(token).transfer(msg.sender, tokensOut);
        totalFeesCollected += platformFee;
        
        // Check graduation
        if (curve.totalRaised >= MIN_ETH_FOR_GRADUATION) {
            _graduateToken(token);
        }
        
        emit TokenPurchased(token, msg.sender, msg.value, tokensOut, newPrice);
        
        return tokensOut;
    }
    
    function sellToken(address token, uint256 tokensIn, uint256 minEthOut) 
        external 
        onlyValidToken(token) 
        nonReentrant 
        antiBot(msg.sender)
        whenNotPaused 
        returns (uint256 ethOut) 
    {
        require(tokensIn > 0, "No tokens to sell");
        require(!graduated[token], "Token graduated");
        
        BondingCurve storage curve = bondingCurves[token];
        
        // Calculate ETH out
        ethOut = getEthOut(tokensIn, curve.tokenReserve, curve.ethReserve);
        uint256 platformFee = (ethOut * PLATFORM_FEE_PERCENTAGE) / 100;
        ethOut -= platformFee;
        
        require(ethOut >= minEthOut, "Slippage too high");
        require(ethOut <= curve.ethReserve - 0.1 ether, "Insufficient liquidity");
        
        // Transfer tokens from seller
        require(
            IERC20(token).transferFrom(msg.sender, address(this), tokensIn),
            "Transfer failed"
        );
        
        // Update reserves
        curve.tokenReserve += tokensIn;
        curve.ethReserve -= (ethOut + platformFee);
        
        // Update stats
        TradingStats storage stats = tradingStats[token];
        stats.totalVolume += ethOut;
        stats.sellCount++;
        stats.lastPrice = getTokenPrice(token);
        
        // Send ETH to seller
        totalFeesCollected += platformFee;
        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "ETH transfer failed");
        
        emit TokenSold(token, msg.sender, tokensIn, ethOut, stats.lastPrice);
        
        return ethOut;
    }
    
    function _graduateToken(address token) private {
        require(!graduated[token], "Already graduated");
        
        BondingCurve storage curve = bondingCurves[token];
        graduated[token] = true;
        tokens[token].isGraduated = true;
        totalGraduatedTokens++;
        
        // Add liquidity to Uniswap
        uint256 tokenAmount = curve.tokenReserve;
        uint256 ethAmount = curve.ethReserve - 0.1 ether; // Keep virtual liquidity
        
        // Approve router
        IERC20(token).approve(UNISWAP_V2_ROUTER, tokenAmount);
        
        // Add liquidity
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        (,, uint256 liquidity) = router.addLiquidityETH{value: ethAmount}(
            token,
            tokenAmount,
            0,
            0,
            address(this), // LP tokens to factory
            block.timestamp + 300
        );
        
        // Get pair address
        address factory = router.factory();
        address pair = IUniswapV2Factory(factory).createPair(token, WETH);
        
        emit TokenGraduated(token, pair, liquidity, block.timestamp);
    }
    
    function _deployToken(string memory name, string memory symbol) private returns (address) {
        bytes memory bytecode = _getProxyBytecode(tokenImplementation);
        bytes32 salt = keccak256(abi.encodePacked(name, symbol, msg.sender, block.timestamp));
        
        address tokenAddress;
        assembly {
            tokenAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(tokenAddress != address(0), "Token deployment failed");
        
        // Initialize token
        IPumpToken(tokenAddress).initialize(
            name,
            symbol,
            INITIAL_SUPPLY,
            address(this),
            address(this)
        );
        
        return tokenAddress;
    }
    
    function _getProxyBytecode(address implementation) private pure returns (bytes memory) {
        return abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
    }
    
    // View functions
    function getTokensOut(uint256 ethIn, uint256 ethReserve, uint256 tokenReserve) 
        public 
        pure 
        returns (uint256) 
    {
        uint256 ethInWithFee = ethIn * 997;
        uint256 numerator = ethInWithFee * tokenReserve;
        uint256 denominator = (ethReserve * 1000) + ethInWithFee;
        return numerator / denominator;
    }
    
    function getEthOut(uint256 tokensIn, uint256 tokenReserve, uint256 ethReserve) 
        public 
        pure 
        returns (uint256) 
    {
        uint256 tokensInWithFee = tokensIn * 997;
        uint256 numerator = tokensInWithFee * ethReserve;
        uint256 denominator = (tokenReserve * 1000) + tokensInWithFee;
        return numerator / denominator;
    }
    
    function getTokenPrice(address token) public view returns (uint256) {
        BondingCurve memory curve = bondingCurves[token];
        if (curve.tokenReserve == 0) return 0;
        return (curve.ethReserve * 10**18) / curve.tokenReserve;
    }
    
    function getUserTokens(address user) external view returns (address[] memory) {
        return userCreatedTokens[user];
    }
    
    function getTokenDetails(address token) 
        external 
        view 
        returns (
            TokenInfo memory info,
            BondingCurve memory curve,
            TradingStats memory stats,
            uint256 price
        ) 
    {
        info = tokens[token];
        curve = bondingCurves[token];
        stats = tradingStats[token];
        price = getTokenPrice(token);
    }
    
    // Admin functions
    function setTokenCreationFee(uint256 newFee) external onlyOwner {
        tokenCreationFee = newFee;
    }
    
    function setTokenImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        tokenImplementation = newImplementation;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function emergencyWithdrawToken(address token, uint256 amount) 
        external 
        onlyOwner 
        onlyValidToken(token) 
    {
        require(graduated[token], "Token not graduated");
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdraw(token, amount);
    }
    
    receive() external payable {}
}
