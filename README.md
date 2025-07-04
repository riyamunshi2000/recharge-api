# Mock Recharge & Bill Payment API

A comprehensive mock API for mobile recharge and bill payment services, optimized for deployment on Vercel.

## Features

### Mobile Recharge
- Support for Bangladesh operators (Grameenphone, Robi, Banglalink, Airtel, Teletalk)
- Transaction tracking and status checking
- Balance inquiry endpoints
- Commission calculation

### Bill Payment
- Utility bill payments (DESCO, WASA, TITAS, BTCL)
- Service fee calculation
- Account verification
- Real-time status updates

## API Endpoints

### Mobile Recharge
- `GET /api/operators` - Get supported mobile operators
- `POST /api/recharge` - Submit mobile recharge request
- `GET /api/recharge/status/:transactionId` - Check recharge status
- `GET /api/recharge/history` - Get recharge transaction history
- `POST /api/balance` - Check mobile balance

### Bill Payment
- `GET /api/billpay/providers` - Get available bill providers
- `POST /api/billpay` - Submit bill payment request
- `GET /api/billpay/status/:transactionId` - Check bill payment status

### General
- `GET /api/test` - API health check
- `GET /api/status` - API status and statistics
- `GET /health` - Server health check
- `GET /` - API documentation

## Deployment

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start production server
pnpm start
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push to main branch

The application is configured with:
- `vercel.json` for optimal serverless deployment
- CORS configuration for production environments
- Conditional server startup for serverless compatibility

## Environment Variables

- `NODE_ENV` - Set to 'production' for production deployment
- `PORT` - Server port (automatically set by Vercel)

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Package Manager**: pnpm
- **Deployment**: Vercel (serverless)
- **CORS**: Configured for multiple origins

## License

MIT License - see LICENSE file for details.
