import {
    Agent,
    type AgentStream,
    type MemoryScope,
    type MemoryStore,
    type Message,
    type UserMessage,
} from "@anvia/core";
import { document } from "./context/document.js";
import { BASE_INSTRUCTION } from "./instruction.js";
import { lensTracing } from "./lens.js";
import { getModel } from "./models.js";

export type AgentUserMessage = UserMessage;

type SharedRunAgentOptions = {
    abortSignal?: AbortSignal;
    modelId?: string;
    memoryStore?: MemoryStore;
};

export type RunAgentOptions = SharedRunAgentOptions &
    (
        | { messages: readonly Message[] }
        | { prompt: string | UserMessage; session: MemoryScope }
    );

export function runAgent(options: RunAgentOptions): AgentStream {
    const { abortSignal, memoryStore, modelId } = options;
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
        memory: memoryStore ? { store: memoryStore, savePolicy: "run" } : undefined,
    });

    if ("messages" in options) {
        return agent.stream({ messages: options.messages, abortSignal });
    }

    return agent.stream({
        prompt: options.prompt,
        session: options.session,
        abortSignal,
    });
}
