import { useEffect, useRef, useState } from "react";
import { FiArrowUp, FiSquare } from "react-icons/fi";

function MessageBubble({ message }) {
  const role = typeof message.role === "string" ? message.role.toLowerCase() : "";
  const isUser = role === "user" || role === "human";
  const bubbleMaxWidth = "max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]";
  const isStreaming = message.streaming && message.content === "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className={bubbleMaxWidth}>
          <div className="rounded-3xl bg-white px-5 py-3 text-[15px] leading-7 text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ) : (
        <div className={`${bubbleMaxWidth} rounded-3xl bg-white/[0.04] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]`}>
          {isStreaming ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-[15px] leading-7 text-neutral-200">
              {message.content}
              {message.streaming ? (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-neutral-400 align-middle" />
              ) : null}
            </div>
          )}
          {message.note ? <div className="mt-3 text-xs text-neutral-500">{message.note}</div> : null}
        </div>
      )}
    </div>
  );
}

export default function ChatModule({
  chatInput,
  displayName,
  messages,
  onChatInputChange,
  onSubmit,
  onStreamingUpdate,
}) {
  const isInitialState = messages.length === 0;
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 140 ? "auto" : "hidden";
  }, [chatInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if last message is an assistant placeholder that needs streaming
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg &&
      lastMsg.role === "assistant" &&
      lastMsg.content === "ai is thinking..." &&
      !isStreaming
    ) {
      streamResponse(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  async function streamResponse(allMessages) {
    // Build the conversation history for the API, excluding the placeholder
    const history = allMessages
      .filter((m) => !(m.role === "assistant" && m.content === "ai is thinking..."))
      .map((m) => ({
        role: m.role === "user" || m.role === "human" ? "user" : "assistant",
        content: m.content,
      }));

    const placeholderMsg = allMessages[allMessages.length - 1];
    if (!placeholderMsg) return;

    setIsStreaming(true);
    // Mark the placeholder as streaming with empty content so we show the dots
    onStreamingUpdate?.(placeholderMsg.id, "", true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are LearnSmart's AI study assistant. You help students understand difficult concepts, prepare for exams, explain topics clearly, and provide study strategies. Be concise but thorough, use examples where helpful, and keep an encouraging, supportive tone.",
          stream: true,
          messages: history,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              accumulated += parsed.delta.text;
              onStreamingUpdate?.(placeholderMsg.id, accumulated, true);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Finalize: mark streaming done
      onStreamingUpdate?.(placeholderMsg.id, accumulated || "Sorry, I couldn't generate a response.", false);
    } catch (err) {
      if (err.name === "AbortError") {
        // User cancelled — keep whatever text was accumulated
        onStreamingUpdate?.(placeholderMsg.id, null, false);
      } else {
        console.error("Streaming error:", err);
        onStreamingUpdate?.(
          placeholderMsg.id,
          "Sorry, I ran into an error. Please try again.",
          false
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  function handleSubmit() {
    if (isStreaming) return;
    onSubmit();
  }

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col">
      <div className="flex w-full flex-1 flex-col pb-28 pt-10 sm:pt-14">
        {isInitialState ? (
          <div className="mb-8">
            <div className="text-[28px] font-medium tracking-tight text-white sm:text-[32px]">
              Hello, {displayName}
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              Ask anything to start a new conversation.
            </div>
          </div>
        ) : null}

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 pb-4 pt-6">
        <div className="w-full rounded-[24px] bg-neutral-900/92 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={(event) => onChatInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              placeholder={isStreaming ? "AI is responding..." : "Ask anything about your studies..."}
              disabled={isStreaming}
              className="min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-[15px] leading-7 text-white outline-none placeholder:text-neutral-500 disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white transition hover:bg-neutral-600"
                aria-label="Stop generation"
              >
                <FiSquare className="text-xs" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!chatInput.trim()}
                className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <FiArrowUp className="text-sm" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}