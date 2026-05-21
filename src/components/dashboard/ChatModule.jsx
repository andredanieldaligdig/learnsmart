import { useEffect, useRef, useState } from "react";
import { FiArrowUp, FiSquare, FiPaperclip, FiX, FiDownload } from "react-icons/fi";
import { exportConversation } from "../../utils/exportConversation.js";

const AI_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AI_CHAT_ENDPOINT = AI_API_BASE_URL ? `${AI_API_BASE_URL}/api/chat` : "/api/chat";
const AI_SYSTEM_PROMPT =
  `You are LearnSmart's AI study assistant - an educational tool designed exclusively for students.

CORE PURPOSE: Help students with academic learning, understanding concepts, exam preparation, research, study strategies, and educational topics only.

ALLOWED TOPICS: Mathematics, Sciences, Languages, History, Literature, Social Studies, Computer Science, Business, Economics, Arts, Philosophy, and other legitimate academic subjects.

STRICTLY PROHIBITED TOPICS - Politely decline and redirect:
- Gaming, video games, game strategies
- Gambling, betting, or any wagering
- Non-educational entertainment
- Illegal activities
- Adult/NSFW content
- Political/religious propaganda
- Personal financial advice (recommend consulting professionals)

RESPONSE GUIDELINES:
1. If a question is educational in nature, provide comprehensive help
2. If a question relates to prohibited topics, politely decline and explain: "I'm designed to help with educational topics. This topic isn't covered in my academic scope. Is there an educational subject I can help you with?"
3. If a general knowledge question extends beyond education (e.g., "What is poker?"), provide basic factual information, but decline deeper engagement
4. Always maintain an encouraging, supportive tone for legitimate academic questions
5. Use clear examples and break down complex concepts

Be concise but thorough. Cite sources when possible. Encourage critical thinking.`;
const REVEAL_FRAME_MS = 18;
const REVEAL_MIN_CHUNK = 1;
const REVEAL_MAX_CHUNK = 16;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "text/plain", "application/msword"],
};

function MessageBubble({ message }) {
  const role = typeof message.role === "string" ? message.role.toLowerCase() : "";
  const isUser = role === "user" || role === "human";
  const bubbleMaxWidth = "max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]";
  const isLoadingState = message.streaming && message.content === "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className={bubbleMaxWidth}>
          <div className="dashboard-action-strong rounded-3xl px-5 py-3 text-[15px] leading-7 shadow-[0_10px_30px_rgba(255,255,255,0.08)]">
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="text-xs opacity-75">
                    📎 {attachment.name}
                  </div>
                ))}
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ) : (
        <div
          className={[
            bubbleMaxWidth,
            "dashboard-surface chat-assistant-bubble relative overflow-hidden rounded-[28px] border px-5 py-4 shadow-[0_12px_36px_rgba(0,0,0,0.22)]",
          ].join(" ")}
        >
          <div className="dashboard-muted mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em]">
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
            <div className="dashboard-copy chat-assistant-copy whitespace-pre-wrap text-[15px] leading-7">
              {message.content}
              {message.streaming ? (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-neutral-400 align-middle" />
              ) : null}
            </div>
          )}

          {message.note ? <div className="dashboard-muted mt-3 text-xs">{message.note}</div> : null}
        </div>
      )}
    </div>
  );
}

function FilePreview({ attachment, onRemove }) {
  const isImage = attachment.type?.startsWith("image/");

  return (
    <div className="dashboard-surface relative flex items-center gap-2 rounded-lg border p-2">
      {isImage ? (
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-white/5">
          <FiPaperclip className="text-sm" />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <div className="truncate text-sm font-medium">{attachment.name}</div>
        <div className="text-xs opacity-60">
          {(attachment.size / 1024).toFixed(1)} KB
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="dashboard-action flex h-7 w-7 shrink-0 items-center justify-center rounded border transition hover:bg-white/5"
        aria-label="Remove attachment"
      >
        <FiX className="text-xs" />
      </button>
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
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const revealStateRef = useRef({ cancelled: false, timerId: null });
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

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

  function handleFileSelect(event) {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      const isImage = ALLOWED_FILE_TYPES.image.includes(file.type);
      const isDocument = ALLOWED_FILE_TYPES.document.includes(file.type);

      if (!isImage && !isDocument) {
        alert(`File type not supported: ${file.type}`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target?.result,
          preview: isImage ? e.target?.result : null,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsArrayBuffer(file);
    }

    event.target.value = "";
  }

  function handleRemoveAttachment(id) {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }

  function handleSubmit() {
    if (isStreaming) return;
    onSubmit(attachments);
    setAttachments([]);
  }

  async function handleExportConversation(format) {
    if (messages.length === 0) {
      alert("No conversation to export");
      return;
    }

    setIsExporting(true);
    try {
      const success = await exportConversation(
        messages,
        format,
        `LearnSmart-Chat-${new Date().toISOString().slice(0, 10)}`
      );
      if (!success && format === "pdf") {
        alert("PDF export requires jsPDF library. Exported as HTML instead. You can save as PDF from your browser.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col">
      <div className="flex w-full flex-1 flex-col pb-32 pt-10 sm:pt-14">
        {isInitialState ? (
          <div className="mb-8">
            <div className="dashboard-title text-[28px] font-medium tracking-tight sm:text-[32px]">
              Hello, {displayName}
            </div>
            <div className="dashboard-muted mt-2 text-sm">
              Ask anything to start a new conversation. You can also upload images and files.
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
        {!isInitialState && (
          <div className="mb-3 flex gap-2 px-3">
            <button
              type="button"
              onClick={() => handleExportConversation("text")}
              disabled={isExporting}
              className="dashboard-action flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition hover:bg-white/5 disabled:opacity-50"
              title="Download conversation as text"
            >
              <FiDownload className="text-sm" />
              Text
            </button>
            <button
              type="button"
              onClick={() => handleExportConversation("html")}
              disabled={isExporting}
              className="dashboard-action flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition hover:bg-white/5 disabled:opacity-50"
              title="Download conversation as HTML (can print to PDF)"
            >
              <FiDownload className="text-sm" />
              HTML
            </button>
            <button
              type="button"
              onClick={() => handleExportConversation("pdf")}
              disabled={isExporting}
              className="dashboard-action flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition hover:bg-white/5 disabled:opacity-50"
              title="Download conversation as PDF"
            >
              <FiDownload className="text-sm" />
              PDF
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 space-y-2 px-3">
            <div className="text-xs opacity-60">Attachments ({attachments.length})</div>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <FilePreview
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={handleRemoveAttachment}
                />
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-panel w-full rounded-[24px] px-3 py-2 backdrop-blur">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="dashboard-action mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50"
              aria-label="Attach file or image"
              title="Attach image or document"
            >
              <FiPaperclip className="text-sm" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="File input"
            />
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
              className="dashboard-textarea dashboard-title min-h-[28px] flex-1 resize-none px-2 py-1 text-[15px] leading-7 outline-none placeholder:text-neutral-500 disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="dashboard-action mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition"
                aria-label="Stop generation"
              >
                <FiSquare className="text-xs" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!chatInput.trim() && attachments.length === 0}
                className="dashboard-action-strong mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40"
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
