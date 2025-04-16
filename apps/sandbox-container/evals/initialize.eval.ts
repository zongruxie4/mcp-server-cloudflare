import { describeEval } from "vitest-evals"
import { eachModel } from "@repo/eval-tools/src/test-models"
import { checkFactuality } from "@repo/eval-tools/src/scorers"
import { ToolExecutionOptions, ToolSet, generateText, tool } from "ai"
import { MCPClientManager } from "agents/mcp/client"
import { runTask } from "./utils"

eachModel("$modelName", ({ model }) => {
    describeEval("Runs container initialize", {
        data: async () => [
            { 
                input: "create and ping a container", 
                expected: "The container_initialize tool was called and then the container_ping tool was called"
            }
        ],
        task: async (input) => {
            return await runTask(model, input)
        },
        scorers: [checkFactuality],
        threshold: 1
    })
})