# Cloudflare MCP Server Monorepo

Model Context Protocol (MCP) is a [new, standardized protocol](https://modelcontextprotocol.io/introduction) for managing context between large language models (LLMs) and external systems. In this repository, we provide an installer as well as an MCP Server for [Cloudflare's API](https://api.cloudflare.com).

This lets you use Claude Desktop, or any MCP Client, to use natural language to accomplish things on your Cloudflare account, e.g.:

* `Please deploy me a new Worker with an example durable object.`
* `Can you tell me about the data in my D1 database named '...'?`
* `Can you copy all the entries from my KV namespace '...' into my R2 bucket '...'?`

## Access the remote MCP server from Claude Desktop

Open Claude Desktop and navigate to Settings -> Developer -> Edit Config. This opens the configuration file that controls which MCP servers Claude can access.

Replace the content with the following configuration. Once you restart Claude Desktop, a browser window will open showing your OAuth login page. Complete the authentication flow to grant Claude access to your MCP server. After you grant access, the tools will become available for you to use.

```
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp-cloudflare-staging.r.workers.dev/sse"
      ]
    }
  }
}
```

## Paid Features

Some features in this MCP server require a paid Cloudflare Workers plan:

- **Observability**: The prefixed `worker_logs_` tools require a paid Workers plan to access these metrics

Ensure your Cloudflare account has the necessary subscription level for the features you intend to use.

## Features

### Workers Management
- `worker_list`: List all Workers in your account
- `worker_get_worker`: Get a Worker's script content

### Workers Logs
- `worker_logs_by_worker_name`: Analyze recent logs for a Cloudflare Worker by worker name
- `worker_logs_by_ray_id`: Analyze recent logs across all workers for a specific request by Cloudflare Ray ID
- `worker_logs_keys`: Get available telemetry keys for a Cloudflare Worker

## Developing

### Apps
- [workers-observability](apps/workers-observability/): The Workers Observability MCP server

### Packages

- eslint-config: Eslint config used by all apps and packages.
- typescript-config: tsconfig used by all apps and packages.
- mcp-common: Shared common tools and scripts to help manage this repo.

For more details on development in this monorepo, take a look at apps/workers-observability

## Testing

The project uses Vitest as the testing framework with MSW (Mock Service Worker) for API mocking.

### Running Tests

To run all tests:

```bash
pnpm test
```

To run a specific test file:

```bash
pnpm test -- tests/tools/queues.test.ts
```

To run tests in watch mode (useful during development):

```bash
pnpm test:watch
```

<<<<<<< HEAD
||||||| d11c245
### Test Structure

The test suite is organized as follows:

- `tests/tools/`: Contains tests for each Cloudflare API tool
- `tests/mocks/`: Contains mock data and request handlers
- `tests/utils/`: Contains test helper functions
- `tests/setup.ts`: Global test setup configuration

Each tool test file follows a consistent pattern of testing both successful operations and error handling scenarios.

## Usage outside of Claude

To run the server locally, run `node dist/index run <account-id>`.

If you're using an alternative MCP Client, or testing things locally, emit the `tools/list` command to get an up-to-date list of all available tools. Then you can call these directly using the `tools/call` command.

### Workers

```javascript
// List workers
worker_list()

// Get worker code
worker_get({ name: "my-worker" })

// Update worker
worker_put({
  name: "my-worker",
  script: "export default { async fetch(request, env, ctx) { ... }}",
  bindings: [
    {
      type: "kv_namespace",
      name: "MY_KV",
      namespace_id: "abcd1234"
    },
    {
      type: "r2_bucket",
      name: "MY_BUCKET",
      bucket_name: "my-files"
    }
  ],
  compatibility_date: "2024-01-01",
  compatibility_flags: ["nodejs_compat"]
})

// Delete worker
worker_delete({ name: "my-worker" })
```

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

// List objects in bucket
r2_list_objects({
    bucket: "my-bucket",
    prefix: "folder/", // optional
    delimiter: "/", // optional
    limit: 1000 // optional
})

// Get object
r2_get_object({
    bucket: "my-bucket",
    key: "folder/file.txt"
})

// Put object
r2_put_object({
    bucket: "my-bucket",
    key: "folder/file.txt",
    content: "Hello, World!",
    contentType: "text/plain" // optional
})

// Delete object
r2_delete_object({
    bucket: "my-bucket",
    key: "folder/file.txt"
})
```

### D1 Database

```javascript
// List databases
d1_list_databases()

// Create database
d1_create_database({ name: "my-database" })

// Delete database
d1_delete_database({ databaseId: "your_database_id" })

// Execute a single query
d1_query({
    databaseId: "your_database_id",
    query: "SELECT * FROM users WHERE age > ?",
    params: ["25"] // optional
})

// Create a table
d1_query({
    databaseId: "your_database_id",
    query: `
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
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

### Durable Objects

```javascript
// List Durable Objects namespaces
durable_objects_list()

// Create a new Durable Objects namespace
durable_objects_create({
    name: "my-durable-object",
    script_name: "my-worker",
    class_name: "MyDurableObjectClass"
})

// Delete a Durable Objects namespace
durable_objects_delete({
    id: "your_namespace_id"
})

// List instances for a namespace
durable_objects_list_instances({
    namespaceId: "your_namespace_id",
    limit: 100 // optional
})

// Get details about a specific instance
durable_objects_get_instance({
    namespaceId: "your_namespace_id",
    instanceId: "your_instance_id"
})

// Delete a specific instance
durable_objects_delete_instance({
    namespaceId: "your_namespace_id",
    instanceId: "your_instance_id"
})
```

### Queues

```javascript
// List all queues
queues_list()

// Create a new queue
queues_create({
    name: "my-queue",
    settings: {
        delivery_delay: 0,
        dead_letter_queue: "dead-letter-queue" // optional
    }
})

// Delete a queue
queues_delete({
    name: "my-queue"
})

// Get queue details
queues_get({
    name: "my-queue"
})

// Send a message to a queue
queues_send_message({
    queue: "my-queue",
    messages: [
        { body: JSON.stringify({ key: "value" }) }
    ]
})

// Get messages from a queue
queues_get_messages({
    queue: "my-queue",
    batchSize: 10, // optional
    visibilityTimeout: 30 // optional, in seconds
})

// Update a queue consumer
queues_update_consumer({
    queue: "my-queue",
    consumer: "my-consumer",
    settings: {
        dead_letter_queue: "dead-letter-queue",
        batch_size: 10,
        max_retries: 3
    }
})
```

### Workers AI

```javascript
// List available AI models
workers_ai_list_models()

// Get details about a specific model
workers_ai_get_model({
    model: "@cf/meta/llama-2-7b-chat-int8"
})

// Run inference using Workers AI
workers_ai_run_inference({
    model: "@cf/meta/llama-2-7b-chat-int8",
    input: {
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello, who are you?" }
        ]
    },
    options: {
        temperature: 0.7,
        max_tokens: 100
    }
})

// List AI tasks
workers_ai_list_tasks()
```

### Workflows

```javascript
// List all workflows
workflows_list()

// Create a new workflow
workflows_create({
    name: "my-workflow",
    content: "// Workflow script content here"
})

// Delete a workflow
workflows_delete({
    name: "my-workflow"
})

// Get workflow details
workflows_get({
    name: "my-workflow"
})

// Update a workflow
workflows_update({
    name: "my-workflow",
    content: "// Updated workflow script content"
})

// Execute a workflow
workflows_execute({
    name: "my-workflow",
    input: { key: "value" }
})
```

### Templates

```javascript
// List available templates
templates_list()

// Get details about a specific template
templates_get({
    template: "worker-typescript"
})

// Create a worker from a template
templates_create_from_template({
    name: "my-new-worker",
    template: "worker-typescript",
    options: {
        // Template-specific options
    }
})
```

### Workers for Platforms

```javascript
// List dispatchers
w4p_list_dispatchers()

// Create a new dispatcher
w4p_create_dispatcher({
    name: "my-dispatcher",
    script: "// Dispatcher script content"
})

// Delete a dispatcher
w4p_delete_dispatcher({
    name: "my-dispatcher"
})

// Get dispatcher details
w4p_get_dispatcher({
    name: "my-dispatcher"
})

// Update dispatcher
w4p_update_dispatcher({
    name: "my-dispatcher",
    script: "// Updated dispatcher script content"
})
```

### Service Bindings

```javascript
// List all service bindings for a worker
bindings_list({
    workerName: "my-worker"
})

// Create a new service binding
bindings_create({
    workerName: "my-worker",
    bindingName: "MY_SERVICE",
    serviceEnvironment: "production",
    serviceName: "target-worker"
})

// Update a service binding
bindings_update({
    workerName: "my-worker",
    bindingName: "MY_SERVICE",
    serviceEnvironment: "staging",
    serviceName: "target-worker"
})

// Delete a service binding
bindings_delete({
    workerName: "my-worker",
    bindingName: "MY_SERVICE"
})
```

### URL Routing

```javascript
// List all routes for a worker
routing_list_routes({
    workerName: "my-worker"
})

// Create a new route
routing_create_route({
    workerName: "my-worker",
    pattern: "example.com/*",
    zoneId: "your_zone_id"
})

// Update a route
routing_update_route({
    routeId: "your_route_id",
    pattern: "api.example.com/*",
    zoneId: "your_zone_id"
})

// Delete a route
routing_delete_route({
    routeId: "your_route_id"
})
```

### Cron Triggers

```javascript
// List all cron triggers for a worker
cron_list({
    workerName: "my-worker"
})

// Create a new cron trigger
cron_create({
    workerName: "my-worker",
    schedule: "*/5 * * * *",
    timezone: "UTC" // optional
})

// Update a cron trigger
cron_update({
    triggerId: "your_trigger_id",
    schedule: "0 */2 * * *",
    timezone: "America/New_York"
})

// Delete a cron trigger
cron_delete({
    triggerId: "your_trigger_id"
})
```

### Zones & Domains

```javascript
// List all zones
zones_list()

// Create a new zone
zones_create({
    name: "example.com",
    account: {
        id: "your_account_id"
    }
})

// Get zone details
zones_get({
    zoneId: "your_zone_id"
})

// Delete a zone
zones_delete({
    zoneId: "your_zone_id"
})

// Check zone activation status
zones_check_activation({
    zoneId: "your_zone_id"
})
```

### Secrets

```javascript
// List all secrets for a worker
secrets_list({
    workerName: "my-worker"
})

// Create or update a secret
secrets_put({
    workerName: "my-worker",
    secretName: "API_KEY",
    secretValue: "your-secret-api-key"
})

// Delete a secret
secrets_delete({
    workerName: "my-worker",
    secretName: "API_KEY"
})
```

### Version Management

```javascript
// List all versions of a worker
versions_list({
    workerName: "my-worker"
})

// Get details about a specific version
versions_get({
    workerName: "my-worker",
    versionId: "your_version_id"
})

// Rollback to a previous version
versions_rollback({
    workerName: "my-worker",
    versionId: "your_version_id"
})
```

### Wrangler Config

```javascript
// Get current wrangler configuration
wrangler_get_config()

// Update wrangler configuration
wrangler_update_config({
    config: {
        name: "my-worker",
        main: "src/index.ts",
        compatibility_date: "2024-03-11",
        workers_dev: true
    }
})
```

=======
## Looking for the deprecated local only cloudflare-mcp-server?

Visit <https://www.npmjs.com/package/@cloudflare/mcp-server-cloudflare>

>>>>>>> 8896f0a3e8a69eb5e9ddf4b0849be8f1ab859c79
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
