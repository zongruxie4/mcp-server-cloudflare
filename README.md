# Cloudflare MCP Server

This is a Model Context Protocol (MCP) server for interacting with Cloudflare services. It provides a unified interface for managing Cloudflare KV Store, Workers, and Analytics.

## Features

### KV Store Operations
- `kv_get`: Retrieve a value from KV store
- `kv_put`: Store a value in KV store
- `kv_delete`: Delete a key from KV store
- `kv_list`: List keys in KV store

### Workers Management
- `worker_list`: List all Workers in your account
- `worker_get`: Get a Worker's script content
- `worker_put`: Create or update a Worker script
- `worker_delete`: Delete a Worker script

### Analytics
- `analytics_get`: Retrieve analytics data for your domain
  - Includes metrics like requests, bandwidth, threats, and page views
  - Supports date range filtering

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your Cloudflare credentials:
   ```
   CLOUDFLARE_ACCOUNT_ID=your_account_id_here
   CLOUDFLARE_API_TOKEN=your_api_token_here
   CLOUDFLARE_KV_NAMESPACE_ID=your_namespace_id_here
   ```
3. Install dependencies: `npm install`
4. Run the server: `./start-cloudflare.sh`

## Usage Examples

### KV Store
```javascript
// Get value
kv_get({ key: "myKey" })

// Store value
kv_put({ key: "myKey", value: "myValue" })

// List keys
kv_list({ prefix: "app_", limit: 10 })
```

### Workers
```javascript
// List workers
worker_list()

// Get worker code
worker_get({ name: "my-worker" })

// Update worker
worker_put({ 
    name: "my-worker",
    script: "addEventListener('fetch', event => { ... })"
})
```

### Analytics
```javascript
// Get today's analytics
analytics_get({ 
    zoneId: "your_zone_id",
    since: "2024-11-26T00:00:00Z",
    until: "2024-11-26T23:59:59Z"
})
```

## Security Notes

- Never commit your `.env` file
- Ensure your Cloudflare API token has appropriate permissions
- Monitor analytics for suspicious activity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.