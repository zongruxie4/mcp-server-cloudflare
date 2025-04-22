import { jsonSchemaToZod } from '@n8n/json-schema-to-zod'
import { MCPClientManager } from 'agents/mcp/client'
import { LanguageModelV1, streamText, tool, ToolSet } from 'ai'
import { z } from 'zod'

import type { JsonSchemaObject } from '@n8n/json-schema-to-zod'

export async function initializeClient(): Promise<MCPClientManager> {
	const clientManager = new MCPClientManager('test-client', '0.0.0')
	await clientManager.connect('http://localhost:8976/sse')
	return clientManager
}

export async function runTask(
	clientManager: MCPClientManager,
	model: LanguageModelV1,
	input: string
) {
	const tools = clientManager.listTools()
	const toolSet: ToolSet = tools.reduce((acc, v) => {
		acc[v.name] = tool({
			parameters: jsonSchemaToZod(v.inputSchema as JsonSchemaObject),
			description: v.description,
			execute: async (args, opts) => {
				try {
					const res = await clientManager.callTool(
						{
							...v,
							arguments: { ...args },
						},
						z.any() as any,
						{ signal: opts.abortSignal }
					)
					return res.content
				} catch (e) {
					console.log('Error calling tool')
					console.log(e)
					return e
				}
			},
		})
		return acc
	}, {} as ToolSet)

	const res = streamText({
		model,
		system:
			"You are an assistant responsible for evaluating the results of calling various tools. Given the user's query, use the tools available to you to answer the question.",
		tools: toolSet,
		prompt: input,
		maxRetries: 1,
		maxSteps: 10,
	})

	for await (const part of res.fullStream) {
	}

	// convert into an LLM readable result so our factuality checker can validate tool calls
	let messagesWithTools = ''
	const messages = (await res.response).messages
	for (const message of messages) {
		console.log(message.content)
		for (const messagePart of message.content) {
			if (typeof messagePart === 'string') {
				messagesWithTools += `<message_content type="text">${messagePart}</message_content>`
			} else if (messagePart.type === 'tool-call') {
				messagesWithTools += `<message_content type=${messagePart.type}>
    <tool_name>${messagePart.toolName}</tool_name>
    <tool_arguments>${JSON.stringify(messagePart.args)}</tool_arguments>
</message_content>`
			} else if (messagePart.type === 'text') {
				messagesWithTools += `<message_content type=${messagePart.type}>${messagePart.text}</message_content>`
			}
		}
	}

	return messagesWithTools
}
