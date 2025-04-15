import { env, fetchMock } from 'cloudflare:test'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { handleWorkerLogs, handleWorkerLogsKeys } from '../src/api/workers-logs'
import { cloudflareClientMockImplementation } from './utils/cloudflare-mock'

beforeAll(() => {
	vi.mock('cloudflare', () => {
		return {
			Cloudflare: vi.fn().mockImplementation(() => {
				return cloudflareClientMockImplementation()
			}),
		}
	})
	// Enable outbound request mocking...
	fetchMock.activate()
	// ...and throw errors if an outbound request isn't mocked
	fetchMock.disableNetConnect()
})

// Ensure we matched every mock we defined
afterEach(() => fetchMock.assertNoPendingInterceptors())

describe('Logs API', () => {
	describe('handleWorkerLogs', () => {
		it('should fetch and analyze worker logs correctly', async () => {
			const scriptName = 'test-worker'

			// Create mock log events
			const mockEvents = [
				{
					timestamp: Date.now() - 100000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'ok',
						eventType: 'fetch',
						requestId: '123456abcdef',
						wallTimeMs: 45.2,
						cpuTimeMs: 12.8,
						event: {
							request: {
								method: 'GET',
								path: '/api/v1/resource',
								url: 'https://example.com/api/v1/resource',
							},
							response: {
								status: 200,
							},
							rayId: 'ray123abc456def',
						},
					},
					source: {
						message: 'Successful request to resource',
					},
					dataset: 'cloudflare-workers',
					$metadata: {
						id: '1',
						message: 'GET /api/v1/resource',
					},
				},
				{
					timestamp: Date.now() - 200000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'ok',
						eventType: 'fetch',
						requestId: '456789bcdef01',
						wallTimeMs: 88.7,
						cpuTimeMs: 33.2,
						event: {
							request: {
								method: 'POST',
								path: '/api/v1/resource/create',
								url: 'https://example.com/api/v1/resource/create',
							},
							response: {
								status: 201,
							},
							rayId: 'ray456def789ghi',
						},
					},
					source: {
						message: 'Created new resource',
					},
					dataset: 'cloudflare-workers',
					$metadata: {
						id: '2',
						message: 'POST /api/v1/resource/create',
					},
				},
				{
					timestamp: Date.now() - 300000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'error',
						eventType: 'fetch',
						requestId: '789012defghi34',
						wallTimeMs: 112.3,
						cpuTimeMs: 45.8,
						event: {
							request: {
								method: 'PUT',
								path: '/api/v1/resource/update',
								url: 'https://example.com/api/v1/resource/update',
							},
							rayId: 'ray789ghi012jkl',
						},
					},
					source: {
						message: 'Resource not found',
					},
					dataset: 'cloudflare-workers',
					$metadata: {
						id: '3',
						message: 'Error updating resource',
					},
				},
			]

			const mockResponse = {
				success: true,
				result: {
					events: {
						events: mockEvents,
						count: 3,
					},
					statistics: {
						elapsed: 10,
						rows_read: 6000,
						bytes_read: 30000000,
					},
				},
				errors: [],
				messages: [{ message: 'Successful request' }],
			}

			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/query`,
				})
				.reply(200, mockResponse)

			const limit = 100
			const minutesAgo = 30
			const result = await handleWorkerLogs({
				scriptName,
				limit,
				minutesAgo,
				accountId: env.CLOUDFLARE_MOCK_ACCOUNT_ID,
				apiToken: env.CLOUDFLARE_MOCK_API_TOKEN,
				shouldFilterErrors: false,
			})

			// Verify that the timestamp range is set correctly
			expect(result).toHaveProperty('from')
			expect(result).toHaveProperty('to')
			expect(result.from).toBeLessThan(result.to)

			expect(result.logs?.events?.count).toBe(3)

			const events = result.logs?.events?.events ?? []
			const getLog = events[0]
			expect(getLog.$workers?.event?.request).toStrictEqual(mockEvents[0].$workers.event.request)
			expect(getLog.$workers?.outcome).toBe(mockEvents[0].$workers.outcome)
			expect(getLog.$workers?.event?.rayId).toBe(mockEvents[0].$workers.event.rayId)
			expect(getLog.$workers?.cpuTimeMs).toBeGreaterThan(0)
			expect(getLog.$workers?.wallTimeMs).toBeGreaterThan(0)

			const postLog = events[1]
			expect(postLog.$workers?.event?.request).toStrictEqual(mockEvents[1].$workers.event.request)
			expect(postLog.$workers?.outcome).toBe(mockEvents[1].$workers.outcome)
			expect(postLog.$workers?.event?.rayId).toBe(mockEvents[1].$workers.event.rayId)
			expect(postLog.$workers?.cpuTimeMs).toBeGreaterThan(0)
			expect(postLog.$workers?.wallTimeMs).toBeGreaterThan(0)

			const errorLog = events[2]
			expect(errorLog.$workers?.event?.request).toStrictEqual(mockEvents[2].$workers.event.request)
			expect(errorLog.$workers?.outcome).toBe(mockEvents[2].$workers.outcome)
			expect(errorLog.$workers?.event?.rayId).toBe(mockEvents[2].$workers.event.rayId)
			expect(errorLog.$workers?.cpuTimeMs).toBeGreaterThan(0)
			expect(errorLog.$workers?.wallTimeMs).toBeGreaterThan(0)
		})

		it('should handle empty logs', async () => {
			const scriptName = 'empty-worker'

			const mockResponse = {
				success: true,
				result: {
					events: {
						events: [],
						count: 0,
					},
					statistics: {
						elapsed: 10,
						rows_read: 6000,
						bytes_read: 30000000,
					},
				},
				errors: [],
				messages: [{ message: 'Successful request' }],
			}

			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/query`,
				})
				.reply(200, mockResponse)

			const limit = 100
			const minutesAgo = 30
			const result = await handleWorkerLogs({
				scriptName,
				limit,
				minutesAgo,
				accountId: env.CLOUDFLARE_MOCK_ACCOUNT_ID,
				apiToken: env.CLOUDFLARE_MOCK_API_TOKEN,
				shouldFilterErrors: false,
			})

			expect(result.logs?.events?.count).toBe(0)
		})

		it('should handle API errors', async () => {
			const scriptName = 'error-worker'

			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/query`,
				})
				.reply(500, 'Server error')

			const limit = 100
			const minutesAgo = 30
			await expect(
				handleWorkerLogs({
					scriptName,
					limit,
					minutesAgo,
					accountId: env.CLOUDFLARE_MOCK_ACCOUNT_ID,
					apiToken: env.CLOUDFLARE_MOCK_API_TOKEN,
					shouldFilterErrors: false,
				})
			).rejects.toThrow('Cloudflare API request failed')
		})

		it('should filter logs by error status when requested', async () => {
			const scriptName = 'test-worker'

			const mockEvents = [
				{
					timestamp: Date.now() - 100000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'ok',
						eventType: 'fetch',
						requestId: '123456abcdef',
						wallTimeMs: 45.2,
						cpuTimeMs: 12.8,
						event: {
							request: {
								method: 'GET',
								path: '/api/v1/resource',
								url: 'https://example.com/api/v1/resource',
							},
							response: {
								status: 200,
							},
							rayId: 'ray123abc456def',
						},
					},
					source: {},
					dataset: 'cloudflare-workers',
					$metadata: { id: '1' },
				},
				{
					timestamp: Date.now() - 200000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'error',
						eventType: 'fetch',
						requestId: '456789bcdef01',
						wallTimeMs: 88.7,
						cpuTimeMs: 33.2,
						event: {
							request: {
								method: 'POST',
								path: '/api/v1/resource/create',
								url: 'https://example.com/api/v1/resource/create',
							},
							rayId: 'ray456def789ghi',
						},
					},
					source: {
						message: 'Invalid request data',
					},
					dataset: 'cloudflare-workers',
					$metadata: { id: '2', error: 'Invalid request data' },
				},
				{
					timestamp: Date.now() - 300000,
					$workers: {
						scriptName: 'test-worker',
						outcome: 'error',
						eventType: 'fetch',
						requestId: '789012defghi34',
						wallTimeMs: 112.3,
						cpuTimeMs: 45.8,
						event: {
							request: {
								method: 'PUT',
								path: '/api/v1/resource/update',
								url: 'https://example.com/api/v1/resource/update',
							},
							rayId: 'ray789ghi012jkl',
						},
					},
					source: {
						message: 'Resource not found',
					},
					dataset: 'cloudflare-workers',
					$metadata: { id: '3', error: 'Resource not found' },
				},
			]

			const mockResponse = {
				success: true,
				result: {
					events: {
						events: mockEvents.filter((event) => event.$workers.outcome === 'error'),
						count: 3,
					},
					statistics: {
						elapsed: 10,
						rows_read: 6000,
						bytes_read: 30000000,
					},
				},
				errors: [],
				messages: [{ message: 'Successful request' }],
			}

			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/query`,
				})
				.reply(200, mockResponse)

			// error filtering enabled
			const limit = 100
			const minutesAgo = 30
			const result = await handleWorkerLogs({
				scriptName,
				limit,
				minutesAgo,
				accountId: env.CLOUDFLARE_MOCK_ACCOUNT_ID,
				apiToken: env.CLOUDFLARE_MOCK_API_TOKEN,
				shouldFilterErrors: true,
			})

			// Check results - we should only get error logs
			expect(
				result.logs?.events?.events?.filter((event) => event.$workers?.outcome == 'error').length
			).toBe(2)
			expect(result.logs?.events?.count).toBe(3)

			const firstErrorLog = result.logs?.events?.events?.find(
				(event) => event.$metadata?.error === 'Invalid request data'
			)
			console.log(firstErrorLog)
			expect(firstErrorLog).toBeDefined()
			expect(firstErrorLog?.$workers?.event?.rayId).toBe('ray456def789ghi')

			const secondErrorLog = result.logs?.events?.events?.find(
				(event) => event.$metadata?.error === 'Resource not found'
			)
			expect(secondErrorLog).toBeDefined()
			expect(secondErrorLog?.$workers?.event?.rayId).toBe('ray789ghi012jkl')
		})
	})

	describe('handleWorkerLogsKeys', () => {
		it('should fetch worker telemetry keys correctly', async () => {
			const scriptName = 'test-worker'

			// Mock telemetry keys response
			const mockKeysResponse = {
				success: true,
				result: [
					{
						key: '$workers.outcome',
						type: 'string',
						lastSeenAt: Date.now() - 1000000,
					},
					{
						key: '$workers.wallTimeMs',
						type: 'number',
						lastSeenAt: Date.now() - 2000000,
					},
					{
						key: '$workers.event.error',
						type: 'boolean',
						lastSeenAt: Date.now() - 3000000,
					},
				],
				errors: [],
				messages: [{ message: 'Successful request' }],
			}

			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/keys`,
				})
				.reply(200, mockKeysResponse)

			const minutesAgo = 10080
			const result = await handleWorkerLogsKeys(
				scriptName,
				minutesAgo,
				env.CLOUDFLARE_MOCK_ACCOUNT_ID,
				env.CLOUDFLARE_MOCK_API_TOKEN
			)

			expect(result).toEqual(mockKeysResponse.result)
			expect(result.length).toBe(3)
			expect(result[0].key).toBe('$workers.outcome')
			expect(result[0].type).toBe('string')
			expect(result[1].key).toBe('$workers.wallTimeMs')
			expect(result[1].type).toBe('number')
			expect(result[2].key).toBe('$workers.event.error')
			expect(result[2].type).toBe('boolean')
		})

		it('should handle API errors when fetching keys', async () => {
			const scriptName = 'error-worker'

			// Setup mock for error response
			fetchMock
				.get('https://api.cloudflare.com')
				.intercept({
					method: 'POST',
					path: `/client/v4/accounts/${env.CLOUDFLARE_MOCK_ACCOUNT_ID}/workers/observability/telemetry/keys`,
				})
				.reply(500, 'Server error')

			const minutesAgo = 10080
			await expect(
				handleWorkerLogsKeys(
					scriptName,
					minutesAgo,
					env.CLOUDFLARE_MOCK_ACCOUNT_ID,
					env.CLOUDFLARE_MOCK_API_TOKEN
				)
			).rejects.toThrow('Cloudflare API request failed')
		})
	})
})
