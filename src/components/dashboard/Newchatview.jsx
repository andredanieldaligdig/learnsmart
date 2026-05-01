import ChatModule from "../ChatModule.jsx";

export default function NewChatView({
  chatInput,
  displayName,
  messages,
  onChatInputChange,
  onSubmit,
  onStreamingUpdate,
}) {
  return (
    <section>
      <ChatModule
        chatInput={chatInput}
        displayName={displayName}
        messages={messages}
        onChatInputChange={onChatInputChange}
        onSubmit={onSubmit}
        onStreamingUpdate={onStreamingUpdate}
      />
    </section>
  );    
}