import { Agent, type AgentStream, type Message } from "@anvia/core";
import { document } from "./context/document.js";
import { BASE_INSTRUCTION } from "./instruction.js";
import { lensTracing } from "./lens.js";
import { getModel } from "./models.js";

export type RunAgentOptions = {
    messages: readonly Message[];
    abortSignal?: AbortSignal;
    modelId?: string;
};

export function runAgent({
    messages,
    abortSignal,
    modelId,
}: RunAgentOptions): AgentStream {
    const agent = new Agent({
        id: "assistant",
        model: getModel(modelId),
        instructions: BASE_INSTRUCTION,
        context: [document],
        observability: { observers: { lens: lensTracing } },
        retries: {
            maxAttempts: 3,
            initialDelayMs: 1_000,
            maxDelayMs: 10_000,
        },
        maxTurns: 25,
    });

    return agent.stream({ messages, abortSignal });
}
