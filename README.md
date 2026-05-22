# `@auxen-ai/langchain`

LangChain.js provider for [Auxen](https://auxen.ai) — private AI models on dedicated GPUs, OpenAI-compatible, pay-per-minute.

## Install

```bash
npm install @auxen-ai/langchain
# or
pnpm add @auxen-ai/langchain
# or
yarn add @auxen-ai/langchain
```

## Quickstart

Provision an instance at [auxen.ai/dashboard](https://auxen.ai/dashboard) and copy the endpoint URL + API key.

```typescript
import { ChatAuxen } from "@auxen-ai/langchain";

const model = new ChatAuxen({
  baseURL: "https://api.auxen.ai/v1/inst_xxx",
  apiKey: "auxk_...",
  model: "llama-3.1-8b",
});

const response = await model.invoke("Hello");
console.log(response.content);
```

Or with environment variables (`AUXEN_BASE_URL` + `AUXEN_API_KEY`):

```typescript
import { ChatAuxen } from "@auxen-ai/langchain";

const model = new ChatAuxen({ model: "llama-3.1-8b" });
```

## Streaming

```typescript
const stream = await model.stream("Tell me a story");
for await (const chunk of stream) {
  process.stdout.write(chunk.content.toString());
}
```

## Tool calling

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(
  async ({ city }) => `Sunny in ${city}`,
  {
    name: "get_weather",
    description: "Get the current weather for a city.",
    schema: z.object({ city: z.string() }),
  },
);

const modelWithTools = model.bindTools([getWeather]);
const response = await modelWithTools.invoke("What's the weather in Paris?");
```

## Structured output

```typescript
import { z } from "zod";

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const structured = model.withStructuredOutput(PersonSchema);
const result = await structured.invoke("Extract: Alice is 30 years old");
console.log(result); // { name: "Alice", age: 30 }
```

## How it works

`ChatAuxen` is a thin subclass of `@langchain/openai`'s `ChatOpenAI` with Auxen-specific defaults — it reads `AUXEN_BASE_URL` / `AUXEN_API_KEY` from the environment and auto-appends `/v1` to the base URL where needed. All ChatOpenAI features (streaming, batch, tool calling, structured output) inherit for free because Auxen is OpenAI-compatible at the wire level.

## Pricing

Auxen bills per minute of GPU runtime, not per token:

| Tier | Models | Rate (1× capacity) |
|---|---|---|
| Small (≤7B) | gemma2-2b, mistral-7b, llama3.2-3b | $0.10/hr |
| Medium (8–14B) | llama3.1-8b, qwen2.5-14b | $0.20/hr |
| Large (24–32B) | mistral-small-24b, qwen2.5-32b | $0.65/hr |
| XL (70B+) | llama3.1-70b, qwen2.5-72b | $1.50/hr |

## Links

- Auxen homepage: <https://auxen.ai>
- Documentation: <https://auxen.ai/docs>
- Source: <https://github.com/auxen-ai/langchain-auxen-js>
- Related: [`@auxen-ai/ai-sdk-provider`](https://github.com/auxen-ai/ai-sdk-provider) (Vercel AI SDK), [`langchain-auxen`](https://github.com/auxen-ai/langchain-auxen) (Python LangChain)

## License

Apache-2.0
