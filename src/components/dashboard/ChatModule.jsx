import { useEffect, useRef, useState } from "react";
import { FiArrowUp, FiSquare } from "react-icons/fi";

const AI_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AI_CHAT_ENDPOINT = AI_API_BASE_URL ? `${AI_API_BASE_URL}/api/chat` : "/api/chat";
const AI_SYSTEM_PROMPT =
  "You are LearnSmart's AI study assistant. You help students understand difficult concepts, prepare for exams, explain topics clearly, and provide study strategies. Be concise but thorough, use examples where helpful, and keep an encouraging, supportive tone.";
const REVEAL_FRAME_MS = 18;
const REVEAL_MIN_CHUNK = 1;
const REVEAL_MAX_CHUNK = 16;

function MessageBubble({ message }) {
  const role = typeof message.role === "string" ? message.role.toLowerCase() : "";
  const isUser = role === "user" || role === "human";
  const bubbleMaxWidth = "max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]";
  const isLoadingState = message.streaming && message.content === "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className={bubbleMaxWidth}>
          <div className="rounded-3xl bg-white px-5 py-3 text-[15px] leading-7 text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ) : (
        <div
          className={[
            bubbleMaxWidth,
            "chat-assistant-bubble relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-4 shadow-[0_12px_36px_rgba(0,0,0,0.22)]",
          ].join(" ")}
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/32">
            <span className="h-px w-6 bg-white/16" />
            LearnSmart AI
          </div>

          {message.streaming ? <div className="chat-assistant-wave pointer-events-none absolute inset-0" /> : null}

          {isLoadingState ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
            </div>
          ) : (
            <div className="chat-assistant-copy whitespace-pre-wrap text-[15px] leading-7 text-neutral-200">
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
  const revealStateRef = useRef({ cancelled: false, timerId: null });
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

  useEffect(() => {
    return () => {
      if (revealStateRef.current.timerId) {
        window.clearTimeout(revealStateRef.current.timerId);
      }
    };
  }, []);

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

  function waitForRevealFrame(duration) {
    return new Promise((resolve) => {
      revealStateRef.current.timerId = window.setTimeout(() => {
        revealStateRef.current.timerId = null;
        resolve();
      }, duration);
    });
  }

  async function revealAssistantResponse(messageId, content) {
    revealStateRef.current.cancelled = false;

    let currentIndex = 0;

    while (currentIndex < content.length) {
      if (revealStateRef.current.cancelled) {
        return false;
      }

      const progress = currentIndex / Math.max(content.length, 1);
      const nextChunkSize = Math.max(
        REVEAL_MIN_CHUNK,
        Math.round(REVEAL_MIN_CHUNK + (REVEAL_MAX_CHUNK - REVEAL_MIN_CHUNK) * progress)
      );

      currentIndex = Math.min(content.length, currentIndex + nextChunkSize);
      onStreamingUpdate?.(messageId, content.slice(0, currentIndex), true);
      await waitForRevealFrame(REVEAL_FRAME_MS);
    }

    return !revealStateRef.current.cancelled;
  }

  async function streamResponse(allMessages) {
    const history = allMessages
      .filter((m) => !(m.role === "assistant" && m.content === "ai is thinking..."))
      .map((m) => ({
        role: m.role === "user" || m.role === "human" ? "user" : "assistant",
        content: m.content,
      }));

    const placeholderMsg = allMessages[allMessages.length - 1];
    if (!placeholderMsg) return;

    setIsStreaming(true);
    onStreamingUpdate?.(placeholderMsg.id, "", true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(AI_CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: history,
          systemPrompt: AI_SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || `API error: ${response.status}`);
      }

      const payload = await response.json();
      const accumulated = payload?.content?.trim() || "Sorry, I couldn't generate a response.";
      const completedReveal = await revealAssistantResponse(placeholderMsg.id, accumulated);

      if (completedReveal) {
        onStreamingUpdate?.(placeholderMsg.id, accumulated, false);
      } else {
        onStreamingUpdate?.(placeholderMsg.id, null, false);
      }
    } catch (err) {
      if (err.name === "AbortError") {
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
      revealStateRef.current.cancelled = false;
    }
  }

  function handleStop() {
    revealStateRef.current.cancelled = true;
    if (revealStateRef.current.timerId) {
      window.clearTimeout(revealStateRef.current.timerId);
      revealStateRef.current.timerId = null;
    }
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
                className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
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
