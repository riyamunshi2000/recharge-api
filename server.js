const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
    next();
});

// Mock database for storing transactions
let rechargeTransactions = [];
let billPaymentTransactions = [];
let transactionCounter = 1000;

// Mock mobile operators data
const operators = {
    'grameenphone': { name: 'Grameenphone', code: 'GP', commission: 2.5 },
    'robi': { name: 'Robi', code: 'ROBI', commission: 2.0 },
    'banglalink': { name: 'Banglalink', code: 'BL', commission: 2.0 },
    'airtel': { name: 'Airtel', code: 'AIRTEL', commission: 1.8 },
    'teletalk': { name: 'Teletalk', code: 'TT', commission: 1.5 }
};

// Mock bill providers data
const billProviders = [
    { 
        id: 1, 
        code: 'DESCO', 
        name: 'DESCO', 
        category: 'electricity',
        min_amount: 50, 
        max_amount: 50000,
        fee_percentage: 1.5,
        processing_time: 'Instant'
    },
    { 
        id: 2, 
        code: 'WASA', 
        name: 'WASA', 
        category: 'water',
        min_amount: 50, 
        max_amount: 25000,
        fee_percentage: 1.0,
        processing_time: '1-2 hours'
    },
    { 
        id: 3, 
        code: 'TITAS', 
        name: 'TITAS', 
        category: 'gas',
        min_amount: 50, 
        max_amount: 20000,
        fee_percentage: 1.2,
        processing_time: 'Instant'
    },
    { 
        id: 4, 
        code: 'BTCL', 
        name: 'BTCL', 
        category: 'internet',
        min_amount: 100, 
        max_amount: 10000,
        fee_percentage: 2.0,
        processing_time: 'Instant'
    }
];

// Helper function to get bill provider by code
function getBillProviderByCode(code) {
    return billProviders.find(provider => provider.code === code);
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Comprehensive Mock Recharge & Bill Payment API',
        version: '2.0.0',
        endpoints: {
            mobile_recharge: {
                'GET /api/operators': 'Get supported mobile operators',
                'POST /api/recharge': 'Submit mobile recharge request',
                'GET /api/recharge/status/:transactionId': 'Check recharge status',
                'GET /api/recharge/history': 'Get recharge transaction history',
                'POST /api/balance': 'Check mobile balance'
            },
            bill_payment: {
                'GET /api/billpay/providers': 'Get available bill providers',
                'POST /api/billpay': 'Submit bill payment request',
                'GET /api/billpay/status/:transactionId': 'Check bill payment status',
                'POST /api/billpay/verify': 'Verify account information'
            },
            general: {
                'GET /api/test': 'API health check',
                'GET /api/status': 'API status and statistics',
                'GET /health': 'Server health check'
            }
        }
    });
});

// API Test endpoints
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Mock Recharge & Bill Payment API is running',
        timestamp: new Date().toISOString(),
        server: 'Comprehensive Mock API Server',
        version: '2.0.0'
    });
});

app.post('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Mock API connection test successful',
        timestamp: new Date().toISOString(),
        server: 'Comprehensive Mock API Server',
        version: '2.0.0',
        test_data: req.body
    });
});

// Get supported mobile operators
app.get('/api/operators', (req, res) => {
    res.json({
        success: true,
        data: operators,
        message: 'Supported mobile operators retrieved successfully'
    });
});

// Mobile recharge endpoint
app.post('/api/recharge', (req, res) => {
    const { phone_number, amount, operator, package_id } = req.body;
    
    // Validate required fields
    if (!phone_number || !amount || !operator) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: phone_number, amount, operator',
            error_code: 'MISSING_REQUIRED_FIELDS'
        });
    }

    // Validate operator
    if (!operators[operator.toLowerCase()]) {
        return res.status(400).json({
            success: false,
            message: `Unsupported operator: ${operator}`,
            error_code: 'UNSUPPORTED_OPERATOR',
            supported_operators: Object.keys(operators)
        });
    }

    // Validate phone number format (Bangladesh mobile numbers)
    const phoneRegex = /^(\+8801|8801|01)[3-9]\d{8}$/;
    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format. Please use Bangladesh mobile number format.',
            error_code: 'INVALID_PHONE_FORMAT'
        });
    }

    // Validate amount
    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount < 10 || rechargeAmount > 5000) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount. Amount should be between 10 and 5000 BDT.',
            error_code: 'INVALID_AMOUNT'
        });
    }

    // Simulate processing delay
    const processingDelay = Math.random() * 2000 + 500; // 500ms to 2.5s
    
    setTimeout(() => {
        // 95% success rate
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
            const transactionId = uuidv4();
            const operatorInfo = operators[operator.toLowerCase()];
            
            const transaction = {
                transaction_id: transactionId,
                external_transaction_id: `EXT${Date.now()}`,
                phone_number,
                amount: rechargeAmount,
                operator: operatorInfo.name,
                operator_code: operatorInfo.code,
                package_id: package_id || null,
                status: 'completed',
                commission: (rechargeAmount * operatorInfo.commission) / 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                processing_time: Math.round(processingDelay)
            };
            
            rechargeTransactions.push(transaction);
            
            res.json({
                success: true,
                message: 'Mobile recharge processed successfully',
                data: transaction
            });
        } else {
            // Simulate failure
            const errorCodes = ['INSUFFICIENT_BALANCE', 'NETWORK_ERROR', 'OPERATOR_DOWN', 'INVALID_NUMBER'];
            const errorMessages = [
                'Insufficient balance in operator account',
                'Network connectivity issue with operator',
                'Operator service temporarily unavailable',
                'Phone number not found in operator network'
            ];
            const randomError = Math.floor(Math.random() * errorCodes.length);
            
            res.status(400).json({
                success: false,
                message: errorMessages[randomError],
                error_code: errorCodes[randomError],
                transaction_reference: `REF${Date.now()}`
            });
        }
    }, processingDelay);
});

// Check mobile recharge status
app.get('/api/recharge/status/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = rechargeTransactions.find(t => t.transaction_id === transactionId);

    if (!transaction) {
        return res.status(404).json({
            success: false,
            error: 'Transaction not found',
            error_code: 'TRANSACTION_NOT_FOUND'
        });
    }

    res.json({
        success: true,
        data: transaction,
        message: 'Mobile recharge transaction details retrieved successfully'
    });
});

// Get mobile recharge transaction history
app.get('/api/recharge/history', (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    
    const paginatedTransactions = rechargeTransactions
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .reverse(); // Most recent first
    
    res.json({
        success: true,
        data: paginatedTransactions,
        total: rechargeTransactions.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        message: 'Mobile recharge transaction history retrieved successfully'
    });
});

// Balance inquiry endpoint
app.post('/api/balance', (req, res) => {
    const { phone_number, operator } = req.body;
    
    if (!phone_number || !operator) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: phone_number, operator',
            error_code: 'MISSING_REQUIRED_FIELDS'
        });
    }
    
    // Simulate balance check
    const mockBalance = Math.floor(Math.random() * 1000) + 10; // Random balance between 10-1010
    
    res.json({
        success: true,
        data: {
            phone_number,
            operator: operators[operator.toLowerCase()]?.name || operator,
            balance: mockBalance,
            currency: 'BDT',
            last_updated: new Date().toISOString()
        },
        message: 'Balance retrieved successfully'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        data: {
            server_status: 'online',
            api_version: '2.0.0',
            uptime: process.uptime(),
            total_recharge_transactions: rechargeTransactions.length,
            total_billpay_transactions: billPaymentTransactions.length,
            recharge_success_rate: rechargeTransactions.length > 0 ? 
                ((rechargeTransactions.filter(t => t.status === 'completed').length / rechargeTransactions.length) * 100).toFixed(2) + '%' 
                : '100%',
            billpay_success_rate: billPaymentTransactions.length > 0 ? 
                ((billPaymentTransactions.filter(t => t.status === 'completed').length / billPaymentTransactions.length) * 100).toFixed(2) + '%' 
                : '100%',
            supported_operators: Object.keys(operators),
            supported_bill_providers: billProviders.map(p => p.code),
            server_time: new Date().toISOString()
        },
        message: 'API status retrieved successfully'
    });
});

// Get available bill providers
app.get('/api/billpay/providers', (req, res) => {
    res.json({
        success: true,
        data: billProviders
    });
});

// Submit bill payment request
app.post('/api/billpay', async (req, res) => {
    try {
        const { 
            provider_code, 
            account_number, 
            customer_name, 
            amount, 
            customer_phone, 
            note 
        } = req.body;

        // Validation
        if (!provider_code || !account_number || !customer_name || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Provider code, account number, customer name, and amount are required'
            });
        }

        const provider = getBillProviderByCode(provider_code);
        if (!provider) {
            return res.status(400).json({
                success: false,
                error: 'Invalid provider code'
            });
        }

        const billAmount = parseFloat(amount);
        if (billAmount < provider.min_amount || billAmount > provider.max_amount) {
            return res.status(400).json({
                success: false,
                error: `Amount must be between ${provider.min_amount} and ${provider.max_amount} BDT for ${provider.name}`
            });
        }

        // Calculate fees
        const serviceFee = billAmount * provider.fee_percentage / 100;
        const totalAmount = billAmount + serviceFee;

        // Generate transaction
        const transaction = {
            transaction_id: uuidv4(),
            provider_code: provider_code,
            provider_name: provider.name,
            account_number: account_number,
            customer_name: customer_name,
            amount: billAmount,
            service_fee: serviceFee,
            total_amount: totalAmount,
            customer_phone: customer_phone || null,
            note: note || null,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        billPaymentTransactions.push(transaction);

        // Simulate processing (95% success rate)
        const processingDelay = provider.processing_time === 'Instant' ? 1000 : 5000;
        
        setTimeout(async () => {
            const txn = billPaymentTransactions.find(t => t.transaction_id === transaction.transaction_id);
            if (txn) {
                txn.status = Math.random() > 0.05 ? 'completed' : 'failed';
                txn.updated_at = new Date().toISOString();
                if (txn.status === 'failed') {
                    txn.error_message = 'Payment processing failed. Please try again.';
                } else {
                    txn.confirmation_number = `${provider_code}${Date.now()}`;
                }
            }
        }, processingDelay);

        res.json({
            success: true,
            message: 'Bill payment request submitted successfully',
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Check bill payment status
app.get('/api/billpay/status/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = billPaymentTransactions.find(t => t.transaction_id === transactionId);

    if (!transaction) {
        return res.status(404).json({
            success: false,
            error: 'Transaction not found'
        });
    }

    res.json({
        success: true,
        data: transaction
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error_code: 'INTERNAL_ERROR'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error_code: 'ENDPOINT_NOT_FOUND'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Comprehensive Mock Recharge & Bill Payment API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 API docs: http://localhost:${PORT}/`);
    console.log(`📱 Mobile recharge: POST http://localhost:${PORT}/api/recharge`);
    console.log(`💰 Bill payment: POST http://localhost:${PORT}/api/billpay`);
    console.log(`📈 API status: http://localhost:${PORT}/api/status`);
});

module.exports = app;
