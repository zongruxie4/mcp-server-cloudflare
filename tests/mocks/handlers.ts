import { http, HttpResponse } from 'msw'
import { mockData } from './data'

// Base URL for Cloudflare API
const baseUrl = 'https://api.cloudflare.com/client/v4'

// Define the pattern matching for MSW
const durableObjectsUrlPattern = new RegExp(`${baseUrl}/accounts/.*/workers/durable_objects/namespaces.*`)

export const mockHandlers = [
  // Queues API
  http.post(`${baseUrl}/accounts/:accountId/queues`, async () => {
    return HttpResponse.json(mockData.queues.create)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/queues/:queueId`, async () => {
    return HttpResponse.json(mockData.queues.delete)
  }),
  http.get(`${baseUrl}/accounts/:accountId/queues`, async () => {
    return HttpResponse.json(mockData.queues.list)
  }),
  http.get(`${baseUrl}/accounts/:accountId/queues/:queueId`, async () => {
    return HttpResponse.json(mockData.queues.get)
  }),
  http.post(`${baseUrl}/accounts/:accountId/queues/:queueId/messages`, async () => {
    return HttpResponse.json(mockData.queues.sendMessage)
  }),
  http.post(`${baseUrl}/accounts/:accountId/queues/:queueId/messages/batch`, async () => {
    return HttpResponse.json(mockData.queues.sendBatch)
  }),
  http.get(`${baseUrl}/accounts/:accountId/queues/:queueId/messages`, async () => {
    return HttpResponse.json(mockData.queues.getMessage)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/queues/:queueId/messages/:messageId`, async () => {
    return HttpResponse.json(mockData.queues.deleteMessage)
  }),
  http.patch(`${baseUrl}/accounts/:accountId/queues/:queueId/messages/:messageId/visibility`, async () => {
    return HttpResponse.json(mockData.queues.updateVisibility)
  }),

  // Durable Objects API - using proper pattern matching
  http.get(durableObjectsUrlPattern, async ({ request }) => {
    const url = new URL(request.url)
    console.log('[MSW] Intercepted DO request:', request.method, url.toString())

    // List namespaces
    if (url.pathname.endsWith('/namespaces') && !url.pathname.includes('/objects')) {
      console.log('[MSW] Handling list namespaces request')
      return HttpResponse.json(mockData.durableObjects.listNamespaces)
    }

    // Get namespace
    if (url.pathname.includes('/namespaces/') && !url.pathname.includes('/objects')) {
      if (url.pathname.includes('namespace-abc123')) {
        console.log('[MSW] Handling get namespace request')
        return HttpResponse.json(mockData.durableObjects.getNamespace)
      }

      if (url.pathname.includes('non-existent-namespace')) {
        console.log('[MSW] Handling non-existent namespace request')
        return HttpResponse.json(
          { success: false, errors: [{ code: 10000, message: 'Namespace not found' }], messages: [], result: null },
          { status: 404 },
        )
      }
    }

    // List objects
    if (url.pathname.includes('/objects') && !url.pathname.includes('/objects/')) {
      console.log('[MSW] Handling list objects request')
      return HttpResponse.json(mockData.durableObjects.listObjects)
    }

    // Get object
    if (url.pathname.includes('/objects/')) {
      if (url.pathname.includes('object-abc123')) {
        console.log('[MSW] Handling get object request')
        return HttpResponse.json(mockData.durableObjects.getObject)
      }
    }

    console.log('[MSW] Unmatched DO GET request:', url.toString())
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
  }),

  // Delete object handler
  http.delete(durableObjectsUrlPattern, async ({ request }) => {
    const url = new URL(request.url)
    console.log('[MSW] Intercepted DO DELETE request:', url.toString())

    if (url.pathname.includes('object-abc123')) {
      console.log('[MSW] Handling delete object request')
      return HttpResponse.json(mockData.durableObjects.deleteObject)
    }

    if (url.pathname.includes('non-existent-object')) {
      console.log('[MSW] Handling delete non-existent object request')
      return HttpResponse.json(
        { success: false, errors: [{ code: 10000, message: 'Object not found' }], messages: [], result: null },
        { status: 404 },
      )
    }

    console.log('[MSW] Unmatched DO DELETE request:', url.toString())
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
  }),

  // Workers AI API
  http.get(`${baseUrl}/accounts/:accountId/ai/models`, async () => {
    return HttpResponse.json(mockData.workersAi.listModels)
  }),
  http.post(`${baseUrl}/accounts/:accountId/ai/run/:modelName`, async () => {
    return HttpResponse.json(mockData.workersAi.runModel)
  }),

  // Workflows API
  http.get(`${baseUrl}/accounts/:accountId/workers/workflows`, async () => {
    return HttpResponse.json(mockData.workflows.list)
  }),
  http.get(`${baseUrl}/accounts/:accountId/workers/workflows/:workflowId`, async () => {
    return HttpResponse.json(mockData.workflows.get)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/workers/workflows/:workflowId`, async () => {
    return HttpResponse.json(mockData.workflows.delete)
  }),
  http.post(`${baseUrl}/accounts/:accountId/workers/workflows`, async () => {
    return HttpResponse.json(mockData.workflows.create)
  }),

  // Templates API
  http.get(`${baseUrl}/accounts/:accountId/workers/templates`, async () => {
    return HttpResponse.json(mockData.templates.list)
  }),
  http.get(`${baseUrl}/accounts/:accountId/workers/templates/:templateId`, async () => {
    return HttpResponse.json(mockData.templates.get)
  }),

  // Workers for Platforms API
  http.get(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.listNamespaces)
  }),
  http.post(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.createNamespace)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces/:namespace`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.deleteNamespace)
  }),
  http.get(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces/:namespace/scripts`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.listScripts)
  }),
  http.put(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces/:namespace/scripts/:scriptName`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.updateScript)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/workers/dispatch/namespaces/:namespace/scripts/:scriptName`, async () => {
    return HttpResponse.json(mockData.workersForPlatforms.deleteScript)
  }),

  // Bindings API
  http.get(`${baseUrl}/accounts/:accountId/workers/services/:serviceName/environments/:envName/bindings`, async () => {
    return HttpResponse.json(mockData.bindings.list)
  }),
  http.put(`${baseUrl}/accounts/:accountId/workers/services/:serviceName/environments/:envName/bindings`, async () => {
    return HttpResponse.json(mockData.bindings.update)
  }),

  // Routing API
  http.get(`${baseUrl}/accounts/:accountId/workers/routes`, async () => {
    return HttpResponse.json(mockData.routing.list)
  }),
  http.post(`${baseUrl}/accounts/:accountId/workers/routes`, async () => {
    return HttpResponse.json(mockData.routing.create)
  }),
  http.delete(`${baseUrl}/accounts/:accountId/workers/routes/:routeId`, async () => {
    return HttpResponse.json(mockData.routing.delete)
  }),

  // Cron API
  http.get(`${baseUrl}/accounts/:accountId/workers/scripts/:scriptName/schedules`, async () => {
    return HttpResponse.json(mockData.cron.list)
  }),
  http.put(`${baseUrl}/accounts/:accountId/workers/scripts/:scriptName/schedules`, async () => {
    return HttpResponse.json(mockData.cron.update)
  }),

  // Zones API
  http.get(`${baseUrl}/zones`, async () => {
    return HttpResponse.json(mockData.zones.list)
  }),
  http.get(`${baseUrl}/zones/:zoneId`, async () => {
    return HttpResponse.json(mockData.zones.get)
  }),

  // Secrets API
  http.get(`${baseUrl}/accounts/:accountId/workers/services/:scriptName/environments/:envName/secrets`, async () => {
    return HttpResponse.json(mockData.secrets.list)
  }),
  http.put(`${baseUrl}/accounts/:accountId/workers/services/:scriptName/environments/:envName/secrets`, async () => {
    return HttpResponse.json(mockData.secrets.create)
  }),
  http.delete(
    `${baseUrl}/accounts/:accountId/workers/services/:scriptName/environments/:envName/secrets/:secretName`,
    async () => {
      return HttpResponse.json(mockData.secrets.delete)
    },
  ),

  // Versions API
  http.get(
    `${baseUrl}/accounts/:accountId/workers/services/:serviceName/environments/:envName/content/v2/versions`,
    async () => {
      return HttpResponse.json(mockData.versions.list)
    },
  ),
  http.get(
    `${baseUrl}/accounts/:accountId/workers/services/:serviceName/environments/:envName/content/v2/versions/:versionId`,
    async () => {
      return HttpResponse.json(mockData.versions.get)
    },
  ),

  // Wrangler API
  http.get(`${baseUrl}/accounts/:accountId/pages/projects`, async () => {
    return HttpResponse.json(mockData.wrangler.listProjects)
  }),
]
