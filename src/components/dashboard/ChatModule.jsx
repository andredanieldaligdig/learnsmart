import { useEffect, useRef } from "react";
import { FiArrowUp } from "react-icons/fi";

function MessageBubble({ message }) {
  const role = typeof message.role === "string" ? message.role.toLowerCase() : "";
  const isUser = role === "user" || role === "human";
  const bubbleMaxWidth = "max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]";

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
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-neutral-200">{message.content}</div>
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
}) {
  const isInitialState = messages.length === 0;
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 140 ? "auto" : "hidden";
  }, [chatInput]);

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
                  onSubmit();
                }
              }}
              rows={1}
              placeholder="Ask anything about your studies..."
              className="min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-[15px] leading-7 text-white outline-none placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={onSubmit}
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200"
              aria-label="Send message"
            >
              <FiArrowUp className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
