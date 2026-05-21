const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json");

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

async function parseRequestBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const config = {
  runtime: "nodejs",
};

function transformMessages(messages) {
  return messages.map((message) => {
    if (!Array.isArray(message?.attachments) || message.attachments.length === 0) {
      return {
        role: message.role,
        content: message.content,
      };
    }

    const content = [];
    const messageText =
      typeof message.content === "string" && message.content !== "Analyze this:"
        ? message.content
        : "";

    // OpenRouter's chat/completions endpoint expects OpenAI-style multimodal content.
    if (messageText) {
      content.push({
        type: "text",
        text: messageText,
      });
    }

    for (const attachment of message.attachments) {
      if (!attachment?.type || typeof attachment.data !== "string") continue;

      if (attachment.type.startsWith("image/")) {
        content.push({
          type: "image_url",
          image_url: {
            url: attachment.data,
          },
        });
        continue;
      }

      if (
        attachment.type.startsWith("text/") ||
        attachment.type.includes("word") ||
        attachment.type.includes("pdf")
      ) {
        content.push({
          type: "text",
          text: `[Document: ${attachment.name || "Untitled"}]\n${attachment.data}`,
        });
      }
    }

    if (content.length === 0) {
      content.push({
        type: "text",
        text: message.content || "Please analyze the attached file.",
      });
    }

    return {
      role: message.role,
      content,
    };
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, { status: 405 });
    }

    if (!OPENROUTER_API_KEY) {
      return jsonResponse({ error: "Missing OPENROUTER_API_KEY." }, { status: 500 });
    }

    const body = await parseRequestBody(request);
    const messages = body?.messages;
    const systemPrompt = body?.systemPrompt;

    if (!Array.isArray(messages) || !messages.length) {
      return jsonResponse({ error: "Messages are required." }, { status: 400 });
    }

    try {
      const transformedMessages = transformMessages(messages);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": PUBLIC_APP_URL,
          "X-Title": "LearnSmart",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            ...transformedMessages,
          ],
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return jsonResponse(
          { error: payload?.error?.message || payload?.error || "AI request failed." },
          { status: response.status }
        );
      }

      const content = payload?.choices?.[0]?.message?.content;

      if (!content) {
        return jsonResponse({ error: "AI provider returned an empty response." }, { status: 502 });
      }

      return jsonResponse({ content });
    } catch (error) {
      console.error("OpenRouter Vercel function error:", error);
      return jsonResponse({ error: "Unable to reach the AI provider right now." }, { status: 500 });
    }
  },
};
