import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ChatAuxen } from "./chat-auxen.js";

const SAMPLE_BASE = "https://api.auxen.ai/v1/inst_test";
const SAMPLE_KEY = "auxk_test_fake";

describe("ChatAuxen", () => {
  let savedBase: string | undefined;
  let savedKey: string | undefined;
  let savedOpenAIKey: string | undefined;

  beforeEach(() => {
    savedBase = process.env.AUXEN_BASE_URL;
    savedKey = process.env.AUXEN_API_KEY;
    savedOpenAIKey = process.env.OPENAI_API_KEY;
    delete process.env.AUXEN_BASE_URL;
    delete process.env.AUXEN_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (savedBase !== undefined) process.env.AUXEN_BASE_URL = savedBase;
    if (savedKey !== undefined) process.env.AUXEN_API_KEY = savedKey;
    if (savedOpenAIKey !== undefined)
      process.env.OPENAI_API_KEY = savedOpenAIKey;
  });

  it("constructs with explicit options", () => {
    const model = new ChatAuxen({
      baseURL: SAMPLE_BASE,
      apiKey: SAMPLE_KEY,
    });
    expect(model).toBeDefined();
    expect(model._llmType()).toBe("auxen-chat");
  });

  it("appends /v1 to base URL when missing", () => {
    const model = new ChatAuxen({
      baseURL: SAMPLE_BASE,
      apiKey: SAMPLE_KEY,
    });
    // openAIApiKey is from ChatOpenAI parent; clientConfig holds baseURL
    const config = (model as unknown as { clientConfig: { baseURL: string } })
      .clientConfig;
    expect(config.baseURL.endsWith("/v1")).toBe(true);
    expect(config.baseURL).toBe(`${SAMPLE_BASE}/v1`);
  });

  it("preserves /v1 when already present", () => {
    const model = new ChatAuxen({
      baseURL: `${SAMPLE_BASE}/v1`,
      apiKey: SAMPLE_KEY,
    });
    const config = (model as unknown as { clientConfig: { baseURL: string } })
      .clientConfig;
    // Should not double up to /v1/v1
    expect(config.baseURL.endsWith("/v1/v1")).toBe(false);
    expect(config.baseURL).toBe(`${SAMPLE_BASE}/v1`);
  });

  it("reads AUXEN_BASE_URL + AUXEN_API_KEY from environment", () => {
    process.env.AUXEN_BASE_URL = SAMPLE_BASE;
    process.env.AUXEN_API_KEY = SAMPLE_KEY;
    const model = new ChatAuxen();
    expect(model).toBeDefined();
  });

  it("throws when baseURL is missing entirely", () => {
    expect(() => new ChatAuxen({ apiKey: SAMPLE_KEY })).toThrow(
      /baseURL is required/,
    );
  });

  it("throws when apiKey is missing entirely", () => {
    expect(() => new ChatAuxen({ baseURL: SAMPLE_BASE })).toThrow(
      /apiKey is required/,
    );
  });

  it("explicit options override env vars", () => {
    process.env.AUXEN_BASE_URL = "https://example.com/v1";
    process.env.AUXEN_API_KEY = "from_env";
    const model = new ChatAuxen({
      baseURL: SAMPLE_BASE,
      apiKey: SAMPLE_KEY,
    });
    const config = (model as unknown as { clientConfig: { baseURL: string } })
      .clientConfig;
    expect(config.baseURL).toContain(SAMPLE_BASE);
  });
});
