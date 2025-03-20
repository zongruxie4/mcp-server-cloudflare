export const mockData = {
  // Queues API mock responses
  queues: {
    create: {
      success: true,
      errors: [],
      messages: [],
      result: {
        queue_id: 'queue-abc123',
        created_on: '2023-01-01T00:00:00Z',
        modified_on: '2023-01-01T00:00:00Z',
        name: 'test-queue',
        producers: [
          {
            name: 'producer-1',
            script: 'test-script-1',
          },
        ],
        consumers: [
          {
            name: 'consumer-1',
            script: 'test-script-2',
            settings: {
              batch_size: 100,
              max_retries: 3,
              max_wait_time_ms: 1000,
            },
          },
        ],
      },
    },
    delete: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          queue_id: 'queue-abc123',
          created_on: '2023-01-01T00:00:00Z',
          modified_on: '2023-01-01T00:00:00Z',
          name: 'test-queue-1',
          producers: [
            {
              name: 'producer-1',
              script: 'test-script-1',
            },
          ],
          consumers: [
            {
              name: 'consumer-1',
              script: 'test-script-2',
              settings: {
                batch_size: 100,
                max_retries: 3,
                max_wait_time_ms: 1000,
              },
            },
          ],
        },
        {
          queue_id: 'queue-def456',
          created_on: '2023-01-02T00:00:00Z',
          modified_on: '2023-01-02T00:00:00Z',
          name: 'test-queue-2',
          producers: [],
          consumers: [],
        },
      ],
    },
    get: {
      success: true,
      errors: [],
      messages: [],
      result: {
        queue_id: 'queue-abc123',
        created_on: '2023-01-01T00:00:00Z',
        modified_on: '2023-01-01T00:00:00Z',
        name: 'test-queue',
        producers: [
          {
            name: 'producer-1',
            script: 'test-script-1',
          },
        ],
        consumers: [
          {
            name: 'consumer-1',
            script: 'test-script-2',
            settings: {
              batch_size: 100,
              max_retries: 3,
              max_wait_time_ms: 1000,
            },
          },
        ],
      },
    },
    sendMessage: {
      success: true,
      errors: [],
      messages: [],
      result: {
        message_id: 'msg-123abc',
      },
    },
    sendBatch: {
      success: true,
      errors: [],
      messages: [],
      result: {
        message_ids: ['msg-123abc', 'msg-456def', 'msg-789ghi'],
      },
    },
    getMessage: {
      success: true,
      errors: [],
      messages: [],
      result: {
        messages: [
          {
            body: 'Test message content',
            id: 'msg-123abc',
            timestamp: 1672531200000,
            receipt_handle: 'receipt-123abc',
          },
        ],
      },
    },
    deleteMessage: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
    updateVisibility: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Durable Objects API mock responses
  durableObjects: {
    listNamespaces: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'namespace-abc123',
          name: 'test-namespace-1',
          script: 'test-script-1',
          class: 'TestClass1',
        },
        {
          id: 'namespace-def456',
          name: 'test-namespace-2',
          script: 'test-script-2',
          class: 'TestClass2',
        },
      ],
    },
    getNamespace: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'namespace-abc123',
        name: 'test-namespace',
        script: 'test-script',
        class: 'TestClass',
      },
    },
    createNamespace: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'namespace-abc123',
        name: 'test-namespace',
        script: 'test-script',
        class: 'TestClass',
      },
    },
    deleteNamespace: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
    listObjects: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'object-abc123',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'object-def456',
          created_at: '2023-01-02T00:00:00Z',
        },
      ],
    },
    getObject: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'object-abc123',
        created_at: '2023-01-01T00:00:00Z',
      },
    },
    deleteObject: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
    listAlarms: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          scheduled_time: '2023-01-01T00:00:00Z',
        },
      ],
    },
    setAlarm: {
      success: true,
      errors: [],
      messages: [],
      result: {
        scheduled_time: '2023-01-01T00:00:00Z',
      },
    },
    deleteAlarm: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Workers AI API mock responses
  workersAi: {
    listModels: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'model-abc123',
          name: '@cf/meta/llama-2-7b-chat-int8',
          description: 'Meta Llama 2 7B Chat model',
          size: '7B parameters',
          capabilities: ['text-generation', 'chat'],
        },
        {
          id: 'model-def456',
          name: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          description: 'Stability AI Stable Diffusion XL model',
          size: '2.6B parameters',
          capabilities: ['image-generation'],
        },
      ],
    },
    runModel: {
      success: true,
      errors: [],
      messages: [],
      result: {
        response: 'This is a test response from the AI model.',
      },
    },
  },

  // Workflows API mock responses
  workflows: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'workflow-abc123',
          name: 'test-workflow-1',
          created_on: '2023-01-01T00:00:00Z',
          modified_on: '2023-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'workflow-def456',
          name: 'test-workflow-2',
          created_on: '2023-01-02T00:00:00Z',
          modified_on: '2023-01-02T00:00:00Z',
          version: 2,
        },
      ],
    },
    get: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'workflow-abc123',
        name: 'test-workflow',
        created_on: '2023-01-01T00:00:00Z',
        modified_on: '2023-01-01T00:00:00Z',
        version: 1,
        definition: {
          steps: [
            {
              name: 'step1',
              type: 'script',
              script: 'test-script-1',
            },
            {
              name: 'step2',
              type: 'wait',
              timeout: 30,
            },
          ],
        },
      },
    },
    create: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'workflow-abc123',
        name: 'test-workflow',
        created_on: '2023-01-01T00:00:00Z',
        modified_on: '2023-01-01T00:00:00Z',
        version: 1,
      },
    },
    delete: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Templates API mock responses
  templates: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'template-abc123',
          name: 'test-template-1',
          description: 'A test template',
          type: 'worker',
          created_on: '2023-01-01T00:00:00Z',
          updated_on: '2023-01-01T00:00:00Z',
        },
        {
          id: 'template-def456',
          name: 'test-template-2',
          description: 'Another test template',
          type: 'worker',
          created_on: '2023-01-02T00:00:00Z',
          updated_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
    get: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'template-abc123',
        name: 'test-template',
        description: 'A test template',
        type: 'worker',
        created_on: '2023-01-01T00:00:00Z',
        updated_on: '2023-01-01T00:00:00Z',
        code: 'addEventListener("fetch", (event) => { event.respondWith(new Response("Hello World")); });',
      },
    },
  },

  // Workers for Platforms API mock responses
  workersForPlatforms: {
    listNamespaces: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'namespace-abc123',
          name: 'test-namespace-1',
          created_on: '2023-01-01T00:00:00Z',
        },
        {
          id: 'namespace-def456',
          name: 'test-namespace-2',
          created_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
    createNamespace: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'namespace-abc123',
        name: 'test-namespace',
        created_on: '2023-01-01T00:00:00Z',
      },
    },
    deleteNamespace: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
    listScripts: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'script-abc123',
          name: 'test-script-1',
          created_on: '2023-01-01T00:00:00Z',
          modified_on: '2023-01-01T00:00:00Z',
        },
        {
          id: 'script-def456',
          name: 'test-script-2',
          created_on: '2023-01-02T00:00:00Z',
          modified_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
    updateScript: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'script-abc123',
        name: 'test-script',
        created_on: '2023-01-01T00:00:00Z',
        modified_on: '2023-01-01T00:00:00Z',
      },
    },
    deleteScript: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Bindings API mock responses
  bindings: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          name: 'KV_BINDING',
          type: 'kv_namespace',
          kv_namespace_id: 'kv-abc123',
        },
        {
          name: 'R2_BINDING',
          type: 'r2_bucket',
          bucket_name: 'test-bucket',
        },
        {
          name: 'DO_BINDING',
          type: 'durable_object_namespace',
          namespace_id: 'namespace-abc123',
        },
      ],
    },
    update: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Routing API mock responses
  routing: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'route-abc123',
          pattern: 'example.com/*',
          script: 'test-script-1',
        },
        {
          id: 'route-def456',
          pattern: 'api.example.com/*',
          script: 'test-script-2',
        },
      ],
    },
    create: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'route-abc123',
        pattern: 'example.com/*',
        script: 'test-script',
      },
    },
    delete: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Cron API mock responses
  cron: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          cron: '*/5 * * * *',
          created_on: '2023-01-01T00:00:00Z',
          modified_on: '2023-01-01T00:00:00Z',
        },
        {
          cron: '0 0 * * *',
          created_on: '2023-01-02T00:00:00Z',
          modified_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
    update: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          cron: '*/10 * * * *',
          created_on: '2023-01-01T00:00:00Z',
          modified_on: '2023-01-01T00:00:00Z',
        },
      ],
    },
  },

  // Zones API mock responses
  zones: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'zone-abc123',
          name: 'example.com',
          status: 'active',
          paused: false,
          type: 'full',
          development_mode: 0,
        },
        {
          id: 'zone-def456',
          name: 'test.com',
          status: 'active',
          paused: false,
          type: 'full',
          development_mode: 0,
        },
      ],
    },
    get: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'zone-abc123',
        name: 'example.com',
        status: 'active',
        paused: false,
        type: 'full',
        development_mode: 0,
      },
    },
  },

  // Secrets API mock responses
  secrets: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          name: 'SECRET_KEY_1',
          type: 'secret_text',
          created_on: '2023-01-01T00:00:00Z',
        },
        {
          name: 'SECRET_KEY_2',
          type: 'secret_text',
          created_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
    create: {
      success: true,
      errors: [],
      messages: [],
      result: {
        name: 'SECRET_KEY',
        type: 'secret_text',
        created_on: '2023-01-01T00:00:00Z',
      },
    },
    delete: {
      success: true,
      errors: [],
      messages: [],
      result: null,
    },
  },

  // Versions API mock responses
  versions: {
    list: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'version-abc123',
          number: 1,
          created_on: '2023-01-01T00:00:00Z',
          metadata: {
            author_id: 'user-123',
            author_email: 'user@example.com',
          },
        },
        {
          id: 'version-def456',
          number: 2,
          created_on: '2023-01-02T00:00:00Z',
          metadata: {
            author_id: 'user-123',
            author_email: 'user@example.com',
          },
        },
      ],
    },
    get: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: 'version-abc123',
        number: 1,
        created_on: '2023-01-01T00:00:00Z',
        metadata: {
          author_id: 'user-123',
          author_email: 'user@example.com',
        },
        script: 'addEventListener("fetch", (event) => { event.respondWith(new Response("Hello World")); });',
      },
    },
  },

  // Wrangler API mock responses
  wrangler: {
    listProjects: {
      success: true,
      errors: [],
      messages: [],
      result: [
        {
          id: 'project-abc123',
          name: 'test-project-1',
          created_on: '2023-01-01T00:00:00Z',
          updated_on: '2023-01-01T00:00:00Z',
        },
        {
          id: 'project-def456',
          name: 'test-project-2',
          created_on: '2023-01-02T00:00:00Z',
          updated_on: '2023-01-02T00:00:00Z',
        },
      ],
    },
  },
}
