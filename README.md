# Cloudflare MCP Server (WIP)

This is a Model Context Protocol (MCP) server for interacting with Cloudflare services. It provides a unified interface for managing Cloudflare KV Store, R2 Storage, Workers, and Analytics.

## Features

### KV Store Management
- `get_kvs`: List all KV namespaces in your account
- `kv_get`: Get a value from a KV namespace
- `kv_put`: Store a value in a KV namespace
- `kv_list`: List keys in a KV namespace
- `kv_delete`: Delete a key from a KV namespace

### R2 Storage Management
- `r2_list_buckets`: List all R2 buckets in your account
- `r2_create_bucket`: Create a new R2 bucket
- `r2_delete_bucket`: Delete an R2 bucket
- `r2_list_objects`: List objects in an R2 bucket
- `r2_get_object`: Get an object from an R2 bucket
- `r2_put_object`: Put an object into an R2 bucket
- `r2_delete_object`: Delete an object from an R2 bucket

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

1. Run `npx @cloudflare/mcp-server-cloudflare init`
2. Restart Claude Desktop, you should see a small 🔨 icon that shows the following tools available for use:

### KV Store
```javascript
// List KV namespaces
get_kvs()

// Get value
kv_get({
    namespaceId: "your_namespace_id",
    key: "myKey"
})

// Store value
kv_put({
    namespaceId: "your_namespace_id",
    key: "myKey",
    value: "myValue",
    expirationTtl: 3600 // optional, in seconds
})

// List keys
kv_list({
    namespaceId: "your_namespace_id",
    prefix: "app_", // optional
    limit: 10 // optional
})

// Delete key
kv_delete({
    namespaceId: "your_namespace_id",
    key: "myKey"
})
```

### R2 Storage

```javascript
// List buckets
r2_list_buckets()

// Create bucket
r2_create_bucket({ name: "my-bucket" })

// Delete bucket
r2_delete_bucket({ name: "my-bucket" })


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

// Delete worker
worker_delete({ name: "my-worker" })
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

## Contributing

In the current project folder, run:

```
pnpm install
pnpm build:watch
```

Then, in a second terminal:

```
node dist/index.js init
```

This will link Claude Desktop against your locally-installed version for you to test.

Contributions are welcome! Please feel free to submit a Pull Request.
