/**
 * ChatAuxen — LangChain.js chat model backed by an Auxen instance.
 *
 * Auxen (https://auxen.ai) hosts private AI model endpoints on
 * dedicated GPUs. Each instance is OpenAI-compatible, so this class
 * is a thin subclass of `@langchain/openai`'s ChatOpenAI with
 * Auxen-specific defaults — env-var resolution and /v1 path
 * normalization.
 *
 * All ChatOpenAI features (streaming, tool calling, structured
 * output, async, with_structured_output, bind_tools, batch) work
 * out of the box because Auxen is OpenAI-compatible at the wire
 * level.
 */

import { ChatOpenAI, ChatOpenAIFields } from "@langchain/openai";

export interface ChatAuxenInput
  extends Omit<ChatOpenAIFields, "configuration"> {
  /**
   * Per-instance base URL issued by the Auxen dashboard, of the
   * form `https://api.auxen.ai/v1/inst_xxx`. Defaults to the
   * AUXEN_BASE_URL environment variable. Auto-appended with `/v1`
   * if not already present.
   */
  baseURL?: string;

  /**
   * Per-instance bearer token (auxk_*) issued by the Auxen
   * dashboard. Defaults to the AUXEN_API_KEY environment variable.
   */
  apiKey?: string;
}

function normalizeBaseURL(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

function resolveBaseURL(explicit: string | undefined): string {
  const url = explicit ?? process.env.AUXEN_BASE_URL;
  if (!url) {
    throw new Error(
      "Auxen baseURL is required. Pass baseURL=... or set the " +
        "AUXEN_BASE_URL environment variable. The base URL is " +
        "issued by the Auxen dashboard at provision time, of the " +
        "form 'https://api.auxen.ai/v1/inst_xxx'.",
    );
  }
  return normalizeBaseURL(url);
}

function resolveApiKey(explicit: string | undefined): string {
  const key = explicit ?? process.env.AUXEN_API_KEY;
  if (!key) {
    throw new Error(
      "Auxen apiKey is required. Pass apiKey=... or set the " +
        "AUXEN_API_KEY environment variable. The key is issued by " +
        "the Auxen dashboard at provision time, of the form 'auxk_...'.",
    );
  }
  return key;
}

export class ChatAuxen extends ChatOpenAI {
  constructor(fields: ChatAuxenInput = {}) {
    const { baseURL, apiKey, model, modelName, ...rest } = fields;
    super({
      ...rest,
      apiKey: resolveApiKey(apiKey),
      configuration: {
        baseURL: resolveBaseURL(baseURL),
      },
      // Auxen routes inference to whichever model the instance is
      // provisioned with — the model name here is mostly cosmetic.
      // Provide a sensible default so LangChain doesn't error.
      model: model ?? modelName ?? "llama-3.1-8b",
    });
  }

  // LangChain uses this identifier to pick prompt templates +
  // serialization. Override so introspection reports "auxen-chat"
  // rather than the parent's "chat-openai".
  _llmType(): string {
    return "auxen-chat";
  }
}
