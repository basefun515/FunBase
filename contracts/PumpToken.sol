// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PumpToken is ERC20, ReentrancyGuard {
    address public creator;
    address public factory;
    bool public initialized;
    
    // Anti-snipe measures
    mapping(address => uint256) private _lastTransfer;
    uint256 private constant TRANSFER_DELAY = 3; // 3 seconds between transfers
    
    // Events
    event TokenInitialized(string name, string symbol, uint256 totalSupply, address creator);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    modifier transferDelay(address from) {
        if (from != factory && from != creator) {
            require(
                block.timestamp >= _lastTransfer[from] + TRANSFER_DELAY,
                "Transfer too frequent"
            );
            _lastTransfer[from] = block.timestamp;
        }
        _;
    }
    
    constructor() ERC20("", "") {
        // Implementation contract, not meant to be used directly
    }
    
    function initialize(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _creator,
        address _factory
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;
        
        creator = _creator;
        factory = _factory;
        
        // Initialize ERC20 metadata
        _name = name;
        _symbol = symbol;
        
        // Mint total supply to factory
        _mint(_factory, totalSupply);
        
        emit TokenInitialized(name, symbol, totalSupply, _creator);
    }
    
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        transferDelay(msg.sender) 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        transferDelay(from) 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
    
    // Prevent sending ETH to token contract
    receive() external payable {
        revert("Cannot receive ETH");
    }
    
    // Override internal functions to make them accessible
    string private _name;
    string private _symbol;
    
    function name() public view virtual override returns (string memory) {
        return _name;
    }
    
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }
}
