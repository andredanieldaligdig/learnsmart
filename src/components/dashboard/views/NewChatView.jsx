import ChatModule from "../ChatModule.jsx";

export default function NewChatView({
  chatInput,
  displayName,
  messages,
  onChatInputChange,
  onSubmit,
}) {
  return (
    <section>
      <ChatModule
        chatInput={chatInput}
        displayName={displayName}
        messages={messages}
        onChatInputChange={onChatInputChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}
