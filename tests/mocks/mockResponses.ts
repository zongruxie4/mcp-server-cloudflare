// Mock data for Workers AI API tests

/**
 * Mock responses for Workers AI API tests
 */
export const workersAiMocks = {
  listModels: {
    success: {
      result: [
        {
          id: '@cf/meta/llama-2-7b-chat-int8',
          name: 'Llama 2 7B',
          description: 'A 7 billion parameter chat model from Meta',
          type: 'text',
          input_type: 'prompt',
          capabilities: ['chat', 'embeddings']
        },
        {
          id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          name: 'Stable Diffusion XL',
          description: 'A state-of-the-art text-to-image model',
          type: 'image',
          input_type: 'prompt',
          capabilities: ['image-generation']
        },
        {
          id: '@cf/deepseek/deepseek-coder-6.7b-instruct',
          name: 'DeepSeek Coder',
          description: 'A 6.7 billion parameter coding model',
          type: 'text',
          input_type: 'prompt',
          capabilities: ['code-generation', 'code-completion']
        }
      ],
      success: true,
      errors: [],
      messages: []
    },
    empty: {
      result: [],
      success: true,
      errors: [],
      messages: ['No models found']
    },
    error: {
      result: null,
      success: false,
      errors: [{ code: 10000, message: 'API error when listing models' }],
      messages: []
    }
  },
  runModel: {
    textSuccess: {
      result: {
        response: "This is a test response from the AI model"
      },
      success: true,
      errors: [],
      messages: []
    },
    imageSuccess: {
      result: {
        data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
      },
      success: true,
      errors: [],
      messages: []
    },
    error: {
      result: null,
      success: false,
      errors: [{ code: 10001, message: 'Error: Failed to run model: invalid input format' }],
      messages: []
    },
    modelNotFound: {
      result: null,
      success: false,
      errors: [{ code: 10002, message: 'Error: Model not found: @cf/non-existent-model' }],
      messages: []
    }
  }
}
