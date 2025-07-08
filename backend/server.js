<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PumpFun Base - Create & Trade Memecoins</title>
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #0052FF;
            --secondary: #00D4FF;
            --success: #00DC82;
            --danger: #FF3366;
            --warning: #FFB800;
            --dark: #0A0E1A;
            --light: #1A1F2E;
            --text: #FFFFFF;
            --text-secondary: #8B92A8;
            --border: #2A3142;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--dark);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            background: rgba(26, 31, 46, 0.95);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s;
            font-weight: 500;
        }

        .nav-link:hover {
            color: var(--text);
        }

        .wallet-btn {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .wallet-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 82, 255, 0.4);
        }

        .hero {
            padding: 4rem 0;
            text-align: center;
            animation: slideIn 0.6s ease-out;
        }

        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--text), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 82, 255, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: var(--text);
            padding: 1rem 2rem;
            border: 2px solid var(--border);
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn-secondary:hover {
            border-color: var(--primary);
            color: var(--primary);
        }

        .stats {
            padding: 2rem 0;
            background: var(--light);
            border-radius: 20px;
            margin: 2rem 0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }

        .stat-card {
            text-align: center;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            border: 1px solid var(--border);
            transition: all 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .tokens-section {
            padding: 3rem 0;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 2rem;
            font-weight: bold;
        }

        .filter-tabs {
            display: flex;
            gap: 1rem;
            background: var(--light);
            padding: 0.25rem;
            border-radius: 12px;
        }

        .filter-tab {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s;
            font-weight: 500;
        }

        .filter-tab.active {
            background: var(--primary);
            color: white;
        }

        .tokens-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .token-card {
            background: var(--light);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid var(--border);
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .token-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 10px 30px rgba(0, 82, 255, 0.2);
        }

        .token-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .token-image {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.25rem;
        }

        .token-info {
            flex: 1;
        }

        .token-name {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
        }

        .token-symbol {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .token-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }

        .token-stat {
            display: flex;
            flex-direction: column;
        }

        .token-stat-label {
            color: var(--text-secondary);
            font-size: 0.8rem;
            margin-bottom: 0.25rem;
        }

        .token-stat-value {
            font-weight: 600;
            font-size: 1rem;
        }

        .token-stat-value.green {
            color: var(--success);
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .modal.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-content {
            background: var(--light);
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s;
            border: 1px solid var(--border);
        }

        .modal.active .modal-content {
            transform: scale(1);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s;
        }

        .close-btn:hover {
            color: var(--text);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--dark);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-size: 1rem;
            transition: all 0.3s;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.1);
        }

        .form-textarea {
            min-height: 100px;
            resize: vertical;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--border);
            border-radius: 50%;
            border-top-color: var(--primary);
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--light);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(400px);
            transition: transform 0.3s;
            z-index: 1000;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast.success {
            border-color: var(--success);
        }

        .toast.error {
            border-color: var(--danger);
        }

        .toast.warning {
            border-color: var(--warning);
        }

        .toast-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .toast.success .toast-icon {
            background: var(--success);
            color: white;
        }

        .toast.error .toast-icon {
            background: var(--danger);
            color: white;
        }

        .toast.warning .toast-icon {
            background: var(--warning);
            color: white;
        }

        /* Debug panel styles */
        .debug-panel {
            position: fixed;
            top: 100px;
            right: 20px;
            width: 300px;
            background: var(--light);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
            font-size: 0.85rem;
            z-index: 999;
            max-height: 60vh;
            overflow-y: auto;
        }

        .debug-toggle {
            position: fixed;
            top: 70px;
            right: 20px;
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            z-index: 1000;
        }

        .warning-box {
            background: rgba(255, 184, 0, 0.1);
            border: 1px solid var(--warning);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .amount-buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .amount-btn {
            background: var(--border);
            color: var(--text);
            border: none;
            padding: 0.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s;
        }

        .amount-btn:hover {
            background: var(--primary);
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .tokens-grid {
                grid-template-columns: 1fr;
            }

            .nav-links {
                display: none;
            }

            .debug-panel {
                position: relative;
                top: auto;
                right: auto;
                width: 100%;
                margin: 1rem 0;
            }

            .debug-toggle {
                position: relative;
                top: auto;
                right: auto;
                display: block;
                margin: 1rem auto;
            }
        }
    </style>
</head>
<body>
    <!-- Debug Toggle -->
    <button class="debug-toggle" onclick="toggleDebug()">Toggle Debug</button>

    <!-- Debug Panel -->
    <div class="debug-panel" id="debugPanel" style="display: none;">
        <h4>Debug Info</h4>
        <div id="debugContent">
            <div>Wallet: <span id="debugWallet">Not connected</span></div>
            <div>Token: <span id="debugToken">None selected</span></div>
            <div>User Balance: <span id="debugUserBalance">0 tokens</span></div>
            <div>Max Wallet: <span id="debugMaxWallet">Loading...</span></div>
            <div>Current Holdings: <span id="debugHoldings">0 tokens</span></div>
            <div>Trade Amount: <span id="debugTradeAmount">0</span></div>
            <div>Resulting Holdings: <span id="debugResultingHoldings">0</span></div>
            <div>Will Exceed Max: <span id="debugWillExceed">No</span></div>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">PumpFun Base</div>
                <div class="nav-links">
                    <a href="#tokens" class="nav-link">Explore</a>
                    <a href="#" class="nav-link" onclick="openModal('createModal'); return false;">Create</a>
                    <button class="wallet-btn" id="connectWallet">Connect Wallet</button>
                </div>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>Launch Your Memecoin on Base</h1>
            <p>Create, trade, and graduate tokens with just a few clicks</p>
            <div class="cta-buttons">
                <button class="btn-primary" id="createTokenBtn">Create Token</button>
                <a href="#tokens" class="btn-secondary">Explore Tokens</a>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="container">
        <div class="stats">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="totalTokens">0</div>
                    <div class="stat-label">Total Tokens</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="totalVolume">$0</div>
                    <div class="stat-label">Total Volume</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="graduatedTokens">0</div>
                    <div class="stat-label">Graduated Tokens</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="totalUsers">0</div>
                    <div class="stat-label">Active Users</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Tokens Section -->
    <section class="tokens-section" id="tokens">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Trending Tokens</h2>
                <div class="filter-tabs">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="new">New</button>
                    <button class="filter-tab" data-filter="trending">Trending</button>
                    <button class="filter-tab" data-filter="graduated">Graduated</button>
                </div>
            </div>
            <div class="tokens-grid" id="tokensGrid">
                <!-- Token cards will be dynamically inserted here -->
            </div>
        </div>
    </section>

    <!-- Create Token Modal -->
    <div class="modal" id="createModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Create Your Token</h2>
                <button class="close-btn" onclick="closeModal('createModal')">&times;</button>
            </div>
            <form id="createTokenForm">
                <div class="form-group">
                    <label class="form-label">Token Name</label>
                    <input type="text" class="form-input" id="tokenName" placeholder="e.g., Based Pepe" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Token Symbol</label>
                    <input type="text" class="form-input" id="tokenSymbol" placeholder="e.g., BPEPE" maxlength="10" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-input form-textarea" id="tokenDescription" placeholder="Tell us about your token..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Image URL</label>
                    <input type="url" class="form-input" id="tokenImage" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label class="form-label">Twitter</label>
                    <input type="url" class="form-input" id="tokenTwitter" placeholder="https://twitter.com/...">
                </div>
                <div class="form-group">
                    <label class="form-label">Telegram</label>
                    <input type="url" class="form-input" id="tokenTelegram" placeholder="https://t.me/...">
                </div>
                <div class="form-group">
                    <label class="form-label">Website</label>
                    <input type="url" class="form-input" id="tokenWebsite" placeholder="https://...">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">
                    Create Token (0.002 ETH)
                </button>
            </form>
        </div>
    </div>

    <!-- Trading Modal -->
    <div class="modal" id="tradeModal">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="modal-title" id="tradeTokenName">Token Name</h2>
                <button class="close-btn" onclick="closeModal('tradeModal')">&times;</button>
            </div>
            
            <!-- Token Info -->
            <div style="margin-bottom: 2rem; padding: 1rem; background: var(--dark); border-radius: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Symbol</div>
                        <div id="tradeTokenSymbol" style="font-weight: 600;"></div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Price</div>
                        <div id="tradeTokenPrice" style="font-weight: 600;"></div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Market Cap</div>
                        <div id="tradeTokenMarketCap" style="font-weight: 600;"></div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Max Per Wallet</div>
                        <div id="tradeTokenMaxWallet" style="font-weight: 600;">Loading...</div>
                    </div>
                </div>
                
                <!-- Current Holdings -->
                <div style="margin-top: 1rem; padding: 0.75rem; background: var(--light); border-radius: 8px;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Your Holdings</div>
                    <div id="userTokenBalance" style="font-weight: 600; color: var(--primary);">Loading...</div>
                </div>
            </div>

            <!-- Warning Box -->
            <div class="warning-box" id="maxWalletWarning" style="display: none;">
                <strong>⚠️ Max Wallet Limit Warning</strong><br>
                This trade would exceed the maximum wallet limit. Please reduce your trade amount.
            </div>

            <!-- Trade Panel -->
            <div style="background: var(--dark); border-radius: 12px; padding: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <button class="btn-primary" style="padding: 0.75rem;" id="buyTab" onclick="setTradeMode('buy')">Buy</button>
                    <button class="btn-secondary" style="padding: 0.75rem;" id="sellTab" onclick="setTradeMode('sell')">Sell</button>
                </div>
                
                <!-- Quick Amount Buttons -->
                <div class="amount-buttons">
                    <button type="button" class="amount-btn" onclick="setQuickAmount(0.001)">0.001</button>
                    <button type="button" class="amount-btn" onclick="setQuickAmount(0.01)">0.01</button>
                    <button type="button" class="amount-btn" onclick="setQuickAmount(0.1)">0.1</button>
                    <button type="button" class="amount-btn" onclick="setQuickAmount(1)">1</button>
                </div>
                
                <form id="tradeForm">
                    <div style="position: relative; margin-bottom: 1rem;">
                        <input type="number" class="form-input" id="tradeAmount" placeholder="0.0" step="0.0001" min="0.0001" required>
                        <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" id="tradeSuffix">ETH</span>
                    </div>
                    
                    <div style="background: var(--light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">You will receive</span>
                            <span id="receiveAmount">0 TOKENS</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">Platform fee (1%)</span>
                            <span id="platformFee">0 ETH</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 600;">
                            <span style="color: var(--text-secondary);">New Holdings</span>
                            <span id="newHoldings">0 TOKENS</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="width: 100%;" id="tradeButton">
                        Buy
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <div class="toast-icon" id="toastIcon"></div>
        <div class="toast-message" id="toastMessage"></div>
    </div>

    <script>
        // Contract configuration
        const FACTORY_ADDRESS = '0x7730469828858529df36A22efB08520C73362244';
        const FACTORY_ABI = [
            "function createToken(string name, string symbol, string description, string imageUrl, string twitter, string telegram, string website) payable returns (address)",
            "function buyToken(address token, uint256 minTokensOut) payable returns (uint256)",
            "function sellToken(address token, uint256 tokensIn, uint256 minEthOut) returns (uint256)",
            "function tokenCreationFee() view returns (uint256)",
            "function totalTokensCreated() view returns (uint256)",
            "function totalGraduatedTokens() view returns (uint256)",
            "function getTokenDetails(address token) view returns (tuple(string name, string symbol, string description, string imageUrl, string twitter, string telegram, string website, address creator, uint256 createdAt, uint256 marketCap, bool isGraduated) info, tuple(uint256 ethReserve, uint256 tokenReserve, uint256 k, uint256 totalRaised, uint256 graduationTarget) curve, tuple(uint256 totalVolume, uint256 buyCount, uint256 sellCount, uint256 uniqueTraders, uint256 highestPrice, uint256 lastPrice) stats, uint256 price)",
            "function calculateTokensOut(address token, uint256 ethIn) view returns (uint256)",
            "function getMaxWalletLimit(address token) view returns (uint256)",
            "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 timestamp)"
        ];

        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function maxWallet() view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function name() view returns (string)",
            "function symbol() view returns (string)"
        ];

        // Global variables
        let provider, signer, factory, userAddress;
        let currentToken = null;
        let currentTokenDetails = null;
        let currentTokenContract = null;
        let tradeMode = 'buy';
        let maxWalletLimit = null;
        let userTokenBalance = null;
        let totalSupply = null;

        // Debug and testing functions
        async function testDirectTokenCall() {
            if (!currentToken || !provider) {
                document.getElementById('testResults').innerHTML = 'No token selected or provider not connected';
                return;
            }

            const results = [];
            const testResults = document.getElementById('testResults');
            
            try {
                results.push('=== DIRECT TOKEN CALLS ===');
                
                const tokenContract = new ethers.Contract(currentToken, ERC20_ABI, provider);
                
                try {
                    const name = await tokenContract.name();
                    results.push(`Name: ${name}`);
                } catch (e) { results.push(`Name: ERROR - ${e.message}`); }
                
                try {
                    const symbol = await tokenContract.symbol();
                    results.push(`Symbol: ${symbol}`);
                } catch (e) { results.push(`Symbol: ERROR - ${e.message}`); }
                
                try {
                    const decimals = await tokenContract.decimals();
                    results.push(`Decimals: ${decimals}`);
                } catch (e) { results.push(`Decimals: ERROR - ${e.message}`); }
                
                try {
                    const totalSupply = await tokenContract.totalSupply();
                    results.push(`Total Supply: ${ethers.utils.formatEther(totalSupply)}`);
                } catch (e) { results.push(`Total Supply: ERROR - ${e.message}`); }
                
                try {
                    const maxWallet = await tokenContract.maxWallet();
                    results.push(`Max Wallet: ${ethers.utils.formatEther(maxWallet)}`);
                } catch (e) { results.push(`Max Wallet: ERROR - ${e.message}`); }
                
                if (userAddress) {
                    try {
                        const balance = await tokenContract.balanceOf(userAddress);
                        results.push(`Your Balance: ${ethers.utils.formatEther(balance)}`);
                    } catch (e) { results.push(`Your Balance: ERROR - ${e.message}`); }
                }
                
            } catch (error) {
                results.push(`GENERAL ERROR: ${error.message}`);
            }
            
            testResults.innerHTML = results.join('<br>');
        }

        async function simulateBuyCalculation() {
            if (!currentToken || !factory) {
                document.getElementById('testResults').innerHTML = 'No token selected or factory not connected';
                return;
            }

            const results = [];
            const testResults = document.getElementById('testResults');
            
            try {
                results.push('=== BUY SIMULATION ===');
                
                const ethAmounts = [0.001, 0.01, 0.1];
                
                for (const ethAmount of ethAmounts) {
                    try {
                        results.push(`--- Testing ${ethAmount} ETH ---`);
                        
                        // Try to calculate tokens out
                        let tokensOut = 'Unknown';
                        try {
                            if (factory.calculateTokensOut) {
                                const calculated = await factory.calculateTokensOut(currentToken, ethers.utils.parseEther(ethAmount.toString()));
                                tokensOut = ethers.utils.formatEther(calculated);
                            }
                        } catch (e) {
                            results.push(`Calculate tokens: ERROR - ${e.message}`);
                        }
                        
                        results.push(`ETH In: ${ethAmount}`);
                        results.push(`Tokens Out: ${tokensOut}`);
                        
                        // Try gas estimation
                        try {
                            if (signer) {
                                const factoryWithSigner = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
                                const gasEstimate = await factoryWithSigner.estimateGas.buyToken(
                                    currentToken, 
                                    0, 
                                    { value: ethers.utils.parseEther(ethAmount.toString()) }
                                );
                                results.push(`Gas Estimate: ${gasEstimate.toString()}`);
                            }
                        } catch (e) {
                            results.push(`Gas Estimation: ERROR - ${e.message}`);
                            if (e.reason) results.push(`Reason: ${e.reason}`);
                        }
                        
                        results.push('');
                    } catch (error) {
                        results.push(`Error testing ${ethAmount}: ${error.message}`);
                    }
                }
                
            } catch (error) {
                results.push(`SIMULATION ERROR: ${error.message}`);
            }
            
            testResults.innerHTML = results.join('<br>');
        }

        // Debug functions
        function toggleDebug() {
            const panel = document.getElementById('debugPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        function updateDebugInfo() {
            document.getElementById('debugWallet').textContent = userAddress ? 
                userAddress.slice(0, 6) + '...' + userAddress.slice(-4) : 'Not connected';
            document.getElementById('debugToken').textContent = currentToken ? 
                currentToken.slice(0, 6) + '...' + currentToken.slice(-4) : 'None selected';
            document.getElementById('debugUserBalance').textContent = userTokenBalance ? 
                parseFloat(ethers.utils.formatEther(userTokenBalance)).toFixed(4) + ' tokens' : '0 tokens';
            document.getElementById('debugMaxWallet').textContent = maxWalletLimit ? 
                parseFloat(ethers.utils.formatEther(maxWalletLimit)).toFixed(4) + ' tokens' : 'Loading...';
            document.getElementById('debugTotalSupply').textContent = totalSupply ? 
                parseFloat(ethers.utils.formatEther(totalSupply)).toFixed(4) + ' tokens' : 'Loading...';
            
            // Calculate max wallet percentage
            if (maxWalletLimit && totalSupply) {
                const maxWalletPercent = (parseFloat(ethers.utils.formatEther(maxWalletLimit)) / parseFloat(ethers.utils.formatEther(totalSupply))) * 100;
                document.getElementById('debugMaxWalletPercent').textContent = maxWalletPercent.toFixed(2) + '%';
            } else {
                document.getElementById('debugMaxWalletPercent').textContent = 'Loading...';
            }
            
            const amount = parseFloat(document.getElementById('tradeAmount')?.value || 0);
            document.getElementById('debugTradeAmount').textContent = amount.toString();
            
            if (userTokenBalance && currentTokenDetails && amount > 0) {
                const currentHoldings = parseFloat(ethers.utils.formatEther(userTokenBalance));
                document.getElementById('debugHoldings').textContent = currentHoldings.toFixed(4) + ' tokens';
                
                if (tradeMode === 'buy') {
                    const price = parseFloat(ethers.utils.formatEther(currentTokenDetails.price));
                    const tokensFromTrade = (amount * 0.99) / price; // After 1% fee
                    const newHoldings = currentHoldings + tokensFromTrade;
                    const maxWallet = maxWalletLimit ? parseFloat(ethers.utils.formatEther(maxWalletLimit)) : 0;
                    
                    document.getElementById('debugTokensFromTrade').textContent = tokensFromTrade.toFixed(4) + ' tokens';
                    document.getElementById('debugResultingHoldings').textContent = newHoldings.toFixed(4) + ' tokens';
                    document.getElementById('debugWillExceed').textContent = (newHoldings > maxWallet) ? 'YES' : 'No';
                } else {
                    const newHoldings = currentHoldings - amount;
                    document.getElementById('debugTokensFromTrade').textContent = '-' + amount.toFixed(4) + ' tokens';
                    document.getElementById('debugResultingHoldings').textContent = newHoldings.toFixed(4) + ' tokens';
                    document.getElementById('debugWillExceed').textContent = 'No';
                }
            }
        }

        // Helper functions
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toastIcon');
            const msg = document.getElementById('toastMessage');
            
            toast.className = 'toast ' + type;
            icon.textContent = type === 'success' ? '✓' : type === 'warning' ? '!' : '✕';
            msg.textContent = message;
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }

        function formatNumber(num) {
            if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
            return num.toFixed(2);
        }

        function setQuickAmount(amount) {
            document.getElementById('tradeAmount').value = amount;
            updateTradePreview();
        }

        // Enhanced token loading with max wallet check
        async function loadTokenDetails(tokenAddress) {
            try {
                currentTokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                
                // Try to get max wallet limit
                try {
                    maxWalletLimit = await currentTokenContract.maxWallet();
                    console.log('Max wallet limit found:', ethers.utils.formatEther(maxWalletLimit));
                } catch (error) {
                    console.log('No maxWallet function found, assuming no limit');
                    maxWalletLimit = null;
                }

                // Get total supply for comparison
                let totalSupply = null;
                try {
                    totalSupply = await currentTokenContract.totalSupply();
                    console.log('Total supply:', ethers.utils.formatEther(totalSupply));
                } catch (error) {
                    console.log('Could not get total supply');
                }

                // Get user's current balance if wallet is connected
                if (userAddress) {
                    userTokenBalance = await currentTokenContract.balanceOf(userAddress);
                    console.log('User balance:', ethers.utils.formatEther(userTokenBalance));
                }

                updateDebugInfo();
                return { maxWalletLimit, userTokenBalance, totalSupply };
            } catch (error) {
                console.error('Error loading token details:', error);
                return { maxWalletLimit: null, userTokenBalance: null, totalSupply: null };
            }
        }

        // Trading functions
        async function openTradeModal(tokenAddress, details) {
            currentToken = tokenAddress;
            currentTokenDetails = details;
            
            document.getElementById('tradeTokenName').textContent = details.info.name;
            document.getElementById('tradeTokenSymbol').textContent = details.info.symbol;
            document.getElementById('tradeTokenPrice').textContent = parseFloat(ethers.utils.formatEther(details.price)).toFixed(8) + ' ETH';
            document.getElementById('tradeTokenMarketCap').textContent = '$' + formatNumber(parseFloat(ethers.utils.formatEther(details.info.marketCap)));
            
            // Load additional token details
            const tokenInfo = await loadTokenDetails(tokenAddress);
            
            if (maxWalletLimit) {
                document.getElementById('tradeTokenMaxWallet').textContent = 
                    parseFloat(ethers.utils.formatEther(maxWalletLimit)).toFixed(4) + ' ' + details.info.symbol;
            } else {
                document.getElementById('tradeTokenMaxWallet').textContent = 'No limit';
            }

            if (userTokenBalance) {
                document.getElementById('userTokenBalance').textContent = 
                    parseFloat(ethers.utils.formatEther(userTokenBalance)).toFixed(4) + ' ' + details.info.symbol;
            } else {
                document.getElementById('userTokenBalance').textContent = 'Connect wallet to view';
            }
            
            setTradeMode('buy');
            openModal('tradeModal');
        }

        function setTradeMode(mode) {
            tradeMode = mode;
            
            const buyTab = document.getElementById('buyTab');
            const sellTab = document.getElementById('sellTab');
            const suffix = document.getElementById('tradeSuffix');
            const button = document.getElementById('tradeButton');
            
            if (mode === 'buy') {
                buyTab.className = 'btn-primary';
                buyTab.style.padding = '0.75rem';
                sellTab.className = 'btn-secondary';
                sellTab.style.padding = '0.75rem';
                suffix.textContent = 'ETH';
                button.textContent = 'Buy';
            } else {
                sellTab.className = 'btn-primary';
                sellTab.style.padding = '0.75rem';
                buyTab.className = 'btn-secondary';
                buyTab.style.padding = '0.75rem';
                suffix.textContent = currentTokenDetails.info.symbol;
                button.textContent = 'Sell';
            }
            
            updateTradePreview();
        }

        function updateTradePreview() {
            const amount = parseFloat(document.getElementById('tradeAmount').value) || 0;
            const receiveElement = document.getElementById('receiveAmount');
            const feeElement = document.getElementById('platformFee');
            const newHoldingsElement = document.getElementById('newHoldings');
            const warningBox = document.getElementById('maxWalletWarning');
            const tradeButton = document.getElementById('tradeButton');
            
            if (amount <= 0 || !currentTokenDetails) {
                receiveElement.textContent = '0 ' + (tradeMode === 'buy' ? 'TOKENS' : 'ETH');
                feeElement.textContent = '0 ETH';
                newHoldingsElement.textContent = '0 TOKENS';
                warningBox.style.display = 'none';
                tradeButton.disabled = false;
                updateDebugInfo();
                return;
            }
            
            const fee = amount * 0.01;
            let willExceedLimit = false;
            
            if (tradeMode === 'buy') {
                const tokensOut = (amount - fee) / parseFloat(ethers.utils.formatEther(currentTokenDetails.price));
                receiveElement.textContent = tokensOut.toFixed(4) + ' ' + currentTokenDetails.info.symbol;
                feeElement.textContent = fee.toFixed(6) + ' ETH';
                
                // Calculate new holdings
                const currentHoldings = userTokenBalance ? parseFloat(ethers.utils.formatEther(userTokenBalance)) : 0;
                const newHoldings = currentHoldings + tokensOut;
                newHoldingsElement.textContent = newHoldings.toFixed(4) + ' ' + currentTokenDetails.info.symbol;
                
                // Check max wallet limit
                if (maxWalletLimit) {
                    const maxWallet = parseFloat(ethers.utils.formatEther(maxWalletLimit));
                    willExceedLimit = newHoldings > maxWallet;
                }
                
            } else {
                const ethOut = amount * parseFloat(ethers.utils.formatEther(currentTokenDetails.price));
                const ethAfterFee = ethOut * 0.99;
                receiveElement.textContent = ethAfterFee.toFixed(6) + ' ETH';
                feeElement.textContent = (ethOut * 0.01).toFixed(6) + ' ETH';
                
                // Calculate new holdings for sell
                const currentHoldings = userTokenBalance ? parseFloat(ethers.utils.formatEther(userTokenBalance)) : 0;
                const newHoldings = Math.max(0, currentHoldings - amount);
                newHoldingsElement.textContent = newHoldings.toFixed(4) + ' ' + currentTokenDetails.info.symbol;
            }
            
            // Show/hide warning and disable button if limit exceeded
            if (willExceedLimit) {
                warningBox.style.display = 'block';
                tradeButton.disabled = true;
                tradeButton.textContent = 'Exceeds Max Wallet Limit';
                showToast('Trade amount would exceed maximum wallet limit', 'warning');
            } else {
                warningBox.style.display = 'none';
                tradeButton.disabled = false;
                tradeButton.textContent = tradeMode === 'buy' ? 'Buy' : 'Sell';
            }
            
            updateDebugInfo();
        }

        async function handleTrade(e) {
            e.preventDefault();
            
            if (!signer) {
                showToast('Please connect your wallet first', 'error');
                return;
            }
            
            const button = e.target.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            
            // Double-check max wallet limit before proceeding
            if (tradeMode === 'buy' && maxWalletLimit && userTokenBalance) {
                const amount = parseFloat(document.getElementById('tradeAmount').value);
                const tokensOut = (amount * 0.99) / parseFloat(ethers.utils.formatEther(currentTokenDetails.price));
                const currentHoldings = parseFloat(ethers.utils.formatEther(userTokenBalance));
                const newHoldings = currentHoldings + tokensOut;
                const maxWallet = parseFloat(ethers.utils.formatEther(maxWalletLimit));
                
                if (newHoldings > maxWallet) {
                    showToast('Transaction would exceed maximum wallet limit', 'error');
                    return;
                }
            }
            
            button.disabled = true;
            button.textContent = 'Processing...';
            
            try {
                const amount = parseFloat(document.getElementById('tradeAmount').value);
                
                if (tradeMode === 'buy') {
                    const value = ethers.utils.parseEther(amount.toString());
                    
                    // Estimate gas to catch revert early
                    try {
                        await factory.estimateGas.buyToken(currentToken, 0, { value });
                    } catch (gasError) {
                        console.error('Gas estimation failed:', gasError);
                        if (gasError.reason && gasError.reason.includes('max wallet')) {
                            throw new Error('Transaction would exceed maximum wallet limit');
                        }
                        throw gasError;
                    }
                    
                    const tx = await factory.buyToken(currentToken, 0, { value });
                    showToast('Buying tokens... Please wait', 'success');
                    await tx.wait();
                    showToast('Purchase successful!', 'success');
                    
                } else {
                    const tokenContract = new ethers.Contract(currentToken, ERC20_ABI, signer);
                    const tokenAmount = ethers.utils.parseEther(amount.toString());
                    
                    const allowance = await tokenContract.allowance(userAddress, FACTORY_ADDRESS);
                    if (allowance.lt(tokenAmount)) {
                        showToast('Approving tokens...', 'success');
                        const approveTx = await tokenContract.approve(FACTORY_ADDRESS, tokenAmount);
                        await approveTx.wait();
                    }
                    
                    const tx = await factory.sellToken(currentToken, tokenAmount, 0);
                    showToast('Selling tokens... Please wait', 'success');
                    await tx.wait();
                    showToast('Sale successful!', 'success');
                }
                
                document.getElementById('tradeAmount').value = '';
                updateTradePreview();
                
                // Refresh token data
                await loadTokenDetails(currentToken);
                await loadKnownTokens([
                    "0x14610B22f3DBF799e7F28006E1a517d4e7bc619a",
                    "0xE5e873f0B59A70757E9474BD8F4449fC158D58Fc"
                ]);
                
            } catch (error) {
                console.error('Trade error:', error);
                let errorMessage = 'Transaction failed';
                
                if (error.message && error.message.includes('max wallet')) {
                    errorMessage = 'Transaction exceeds maximum wallet limit';
                } else if (error.reason) {
                    errorMessage = error.reason;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showToast(errorMessage, 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        }

        // Connect wallet
        async function connectWallet() {
            try {
                console.log("Connecting wallet...");
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAddress = accounts[0];
                
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== '0x14a34') {
                    showToast('Please switch to Base Sepolia network', 'error');
                    return;
                }

                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

                document.getElementById('connectWallet').textContent = 
                    userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
                
                showToast('Wallet connected!', 'success');
                updateDebugInfo();
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to connect wallet', 'error');
            }
        }

        // Load stats
        async function loadStats() {
            try {
                console.log("Loading stats...");
                const tempFactory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
                const totalTokens = await tempFactory.totalTokensCreated();
                const graduatedTokens = await tempFactory.totalGraduatedTokens();
                
                document.getElementById('totalTokens').textContent = totalTokens.toString();
                document.getElementById('graduatedTokens').textContent = graduatedTokens.toString();
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        // Load known tokens
        async function loadKnownTokens(tokenAddresses) {
            const tokensGrid = document.getElementById('tokensGrid');
            tokensGrid.innerHTML = '';
            
            for (const address of tokenAddresses) {
                try {
                    const tempFactory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
                    const details = await tempFactory.getTokenDetails(address);
                    const tokenCard = createTokenCard(address, details);
                    tokensGrid.appendChild(tokenCard);
                } catch (error) {
                    console.error('Error loading token:', address, error);
                }
            }
        }

        // Create token card
        function createTokenCard(address, details) {
            const card = document.createElement('div');
            card.className = 'token-card';
            
            const info = details.info;
            const price = ethers.utils.formatEther(details.price);
            
            card.innerHTML = `
                <div class="token-header">
                    <div class="token-image">${info.symbol.charAt(0)}</div>
                    <div class="token-info">
                        <div class="token-name">${info.name}</div>
                        <div class="token-symbol">${info.symbol}</div>
                    </div>
                </div>
                <div class="token-stats">
                    <div class="token-stat">
                        <div class="token-stat-label">Price</div>
                        <div class="token-stat-value">${parseFloat(price).toFixed(8)} ETH</div>
                    </div>
                    <div class="token-stat">
                        <div class="token-stat-label">Market Cap</div>
                        <div class="token-stat-value">$${formatNumber(parseFloat(ethers.utils.formatEther(info.marketCap)))}</div>
                    </div>
                    <div class="token-stat">
                        <div class="token-stat-label">Creator</div>
                        <div class="token-stat-value">${info.creator.slice(0, 6)}...${info.creator.slice(-4)}</div>
                    </div>
                    <div class="token-stat">
                        <div class="token-stat-label">Status</div>
                        <div class="token-stat-value ${info.isGraduated ? 'green' : ''}">${info.isGraduated ? 'Graduated' : 'Active'}</div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openTradeModal(address, details);
            });
            
            return card;
        }

        // Create token
        async function handleCreateToken(e) {
            e.preventDefault();
            
            if (!signer) {
                showToast('Please connect your wallet first', 'error');
                return;
            }

            const button = e.target.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Creating...';

            try {
                const name = document.getElementById('tokenName').value;
                const symbol = document.getElementById('tokenSymbol').value;
                const description = document.getElementById('tokenDescription').value || '';
                const imageUrl = document.getElementById('tokenImage').value || '';
                const twitter = document.getElementById('tokenTwitter').value || '';
                const telegram = document.getElementById('tokenTelegram').value || '';
                const website = document.getElementById('tokenWebsite').value || '';

                const fee = await factory.tokenCreationFee();
                const tx = await factory.createToken(
                    name, symbol, description, imageUrl, twitter, telegram, website,
                    { value: fee }
                );
                
                showToast('Creating token... Please wait', 'success');
                await tx.wait();
                
                showToast('Token created successfully!', 'success');
                closeModal('createModal');
                e.target.reset();
                await loadStats();
                await loadKnownTokens([
                    "0x14610B22f3DBF799e7F28006E1a517d4e7bc619a",
                    "0xE5e873f0B59A70757E9474BD8F4449fC158D58Fc"
                ]);
                
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to create token', 'error');
            } finally {
                button.disabled = false;
                button.textContent = 'Create Token (0.002 ETH)';
            }
        }

        // Initialize app
        async function init() {
            console.log("Initializing app...");
            
            if (typeof window.ethereum === 'undefined') {
                showToast('Please install MetaMask to use this app', 'error');
                return;
            }

            // Event listeners
            document.getElementById('connectWallet').addEventListener('click', connectWallet);
            document.getElementById('createTokenBtn').addEventListener('click', () => openModal('createModal'));
            document.getElementById('createTokenForm').addEventListener('submit', handleCreateToken);
            document.getElementById('tradeForm').addEventListener('submit', handleTrade);
            document.getElementById('tradeAmount').addEventListener('input', updateTradePreview);

            // Load initial data
            try {
                provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
                console.log("Connected to Base Sepolia RPC");
                
                await loadStats();
                
                const knownTokens = [
                    "0x14610B22f3DBF799e7F28006E1a517d4e7bc619a",
                    "0xE5e873f0B59A70757E9474BD8F4449fC158D58Fc"
                ];
                
                await loadKnownTokens(knownTokens);
                updateDebugInfo();
            } catch (error) {
                console.error('Error initializing:', error);
                showToast('Network connection issues. Please refresh.', 'error');
            }
        }

        // Initialize on load
        window.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
