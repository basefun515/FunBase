// backend/server.js
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const FACTORY_ADDRESS = '0x7730469828858529df36A22efB08520C73362244';
const RPC_URL = 'https://sepolia.base.org';
const PORT = process.env.PORT || 3001;

// Contract ABI (minimal)
const FACTORY_ABI = [
    "event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 timestamp)",
    "event TokenPurchased(address indexed token, address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 newPrice)",
    "event TokenSold(address indexed token, address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 newPrice)",
    "function getTokenDetails(address token) view returns (tuple(string name, string symbol, string description, string imageUrl, string twitter, string telegram, string website, address creator, uint256 createdAt, uint256 marketCap, bool isGraduated) info, tuple(uint256 ethReserve, uint256 tokenReserve, uint256 k, uint256 totalRaised, uint256 graduationTarget) curve, tuple(uint256 totalVolume, uint256 buyCount, uint256 sellCount, uint256 uniqueTraders, uint256 highestPrice, uint256 lastPrice) stats, uint256 price)"
];

// Initialize
let provider;
let factory;
let db;

async function init() {
    // Connect to Base Sepolia
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    // Initialize database
    db = await open({
        filename: './tokens.db',
        driver: sqlite3.Database
    });
    
    // Create tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tokens (
            address TEXT PRIMARY KEY,
            name TEXT,
            symbol TEXT,
            description TEXT,
            imageUrl TEXT,
            twitter TEXT,
            telegram TEXT,
            website TEXT,
            creator TEXT,
            createdAt INTEGER,
            blockNumber INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenAddress TEXT,
            type TEXT,
            trader TEXT,
            ethAmount TEXT,
            tokenAmount TEXT,
            price TEXT,
            timestamp INTEGER,
            txHash TEXT,
            blockNumber INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS token_stats (
            tokenAddress TEXT PRIMARY KEY,
            currentPrice TEXT,
            marketCap TEXT,
            totalVolume TEXT,
            buyCount INTEGER,
            sellCount INTEGER,
            uniqueTraders INTEGER,
            highestPrice TEXT,
            isGraduated INTEGER,
            lastUpdated INTEGER
        );
    `);
    
    // Start event listeners
    startEventListeners();
    
    // Sync historical data
    await syncHistoricalData();
}

// Event listeners
function startEventListeners() {
    // Listen for new tokens
    factory.on('TokenCreated', async (token, creator, name, symbol, timestamp, event) => {
        console.log(`New token created: ${name} (${symbol}) at ${token}`);
        
        try {
            const details = await factory.getTokenDetails(token);
            await saveToken(token, details.info, event.blockNumber);
            await updateTokenStats(token, details);
        } catch (error) {
            console.error('Error processing new token:', error);
        }
    });
    
    // Listen for trades
    factory.on('TokenPurchased', async (token, buyer, ethIn, tokensOut, newPrice, event) => {
        await saveTrade(token, 'buy', buyer, ethIn, tokensOut, newPrice, event);
        await updateTokenStats(token);
    });
    
    factory.on('TokenSold', async (token, seller, tokensIn, ethOut, newPrice, event) => {
        await saveTrade(token, 'sell', seller, ethOut, tokensIn, newPrice, event);
        await updateTokenStats(token);
    });
}

// Database functions
async function saveToken(address, info, blockNumber) {
    await db.run(
        `INSERT OR REPLACE INTO tokens 
        (address, name, symbol, description, imageUrl, twitter, telegram, website, creator, createdAt, blockNumber)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            address,
            info.name,
            info.symbol,
            info.description,
            info.imageUrl,
            info.twitter,
            info.telegram,
            info.website,
            info.creator,
            info.createdAt.toNumber(),
            blockNumber
        ]
    );
}

async function saveTrade(tokenAddress, type, trader, ethAmount, tokenAmount, price, event) {
    await db.run(
        `INSERT INTO trades 
        (tokenAddress, type, trader, ethAmount, tokenAmount, price, timestamp, txHash, blockNumber)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tokenAddress,
            type,
            trader,
            ethAmount.toString(),
            tokenAmount.toString(),
            price.toString(),
            Date.now(),
            event.transactionHash,
            event.blockNumber
        ]
    );
}

async function updateTokenStats(tokenAddress, details = null) {
    if (!details) {
        details = await factory.getTokenDetails(tokenAddress);
    }
    
    await db.run(
        `INSERT OR REPLACE INTO token_stats 
        (tokenAddress, currentPrice, marketCap, totalVolume, buyCount, sellCount, 
         uniqueTraders, highestPrice, isGraduated, lastUpdated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tokenAddress,
            details.price.toString(),
            details.info.marketCap.toString(),
            details.stats.totalVolume.toString(),
            details.stats.buyCount.toNumber(),
            details.stats.sellCount.toNumber(),
            details.stats.uniqueTraders.toNumber(),
            details.stats.highestPrice.toString(),
            details.info.isGraduated ? 1 : 0,
            Date.now()
        ]
    );
}

// Sync historical data
async function syncHistoricalData() {
    console.log('Syncing historical data...');
    
    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks
        
        // Get all TokenCreated events
        const filter = factory.filters.TokenCreated();
        const events = await factory.queryFilter(filter, fromBlock, currentBlock);
        
        console.log(`Found ${events.length} historical tokens`);
        
        for (const event of events) {
            const token = event.args.token;
            try {
                const details = await factory.getTokenDetails(token);
                await saveToken(token, details.info, event.blockNumber);
                await updateTokenStats(token, details);
            } catch (error) {
                console.error(`Error syncing token ${token}:`, error);
            }
        }
        
        console.log('Historical sync complete');
    } catch (error) {
        console.error('Error syncing historical data:', error);
    }
}

// API Routes
app.get('/api/tokens', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'newest' } = req.query;
        const offset = (page - 1) * limit;
        
        let orderBy = 'createdAt DESC';
        if (sort === 'volume') orderBy = 'totalVolume DESC';
        if (sort === 'price') orderBy = 'currentPrice DESC';
        
        const tokens = await db.all(`
            SELECT t.*, s.currentPrice, s.marketCap, s.totalVolume, s.isGraduated
            FROM tokens t
            LEFT JOIN token_stats s ON t.address = s.tokenAddress
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        res.json({ tokens });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Failed to fetch tokens' });
    }
});

app.get('/api/tokens/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Get token info from database
        const token = await db.get(
            'SELECT * FROM tokens WHERE address = ?',
            [address]
        );
        
        if (!token) {
            return res.status(404).json({ error: 'Token not found' });
        }
        
        // Get latest stats from contract
        const details = await factory.getTokenDetails(address);
        await updateTokenStats(address, details);
        
        // Get recent trades
        const trades = await db.all(
            `SELECT * FROM trades 
             WHERE tokenAddress = ? 
             ORDER BY timestamp DESC 
             LIMIT 50`,
            [address]
        );
        
        res.json({
            token,
            details: {
                info: details.info,
                curve: details.curve,
                stats: details.stats,
                price: details.price.toString()
            },
            trades
        });
    } catch (error) {
        console.error('Error fetching token details:', error);
        res.status(500).json({ error: 'Failed to fetch token details' });
    }
});

app.get('/api/tokens/:address/chart', async (req, res) => {
    try {
        const { address } = req.params;
        const { interval = '1h', limit = 100 } = req.query;
        
        // Get trades grouped by interval
        const trades = await db.all(
            `SELECT 
                strftime('%Y-%m-%d %H:00:00', datetime(timestamp/1000, 'unixepoch')) as hour,
                AVG(CAST(price as REAL)) as avgPrice,
                SUM(CAST(ethAmount as REAL)) as volume,
                COUNT(*) as tradeCount
             FROM trades 
             WHERE tokenAddress = ?
             GROUP BY hour
             ORDER BY hour DESC
             LIMIT ?`,
            [address, limit]
        );
        
        res.json({ chart: trades.reverse() });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(DISTINCT address) as totalTokens,
                COUNT(DISTINCT CASE WHEN isGraduated = 1 THEN tokenAddress END) as graduatedTokens,
                SUM(CAST(totalVolume as REAL)) as totalVolume,
                COUNT(DISTINCT trader) as uniqueTraders
            FROM tokens t
            LEFT JOIN token_stats s ON t.address = s.tokenAddress
            LEFT JOIN trades tr ON t.address = tr.tokenAddress
        `);
        
        res.json({ stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', blockNumber: provider._lastBlockNumber });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Backend server running on port ${PORT}`);
    await init();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    if (db) await db.close();
    process.exit(0);
});
