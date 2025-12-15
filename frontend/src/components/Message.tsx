"use client";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function bubbleStyle(role: ChatMessage["role"]): React.CSSProperties {
  const isUser = role === "user";
  return {
    maxWidth: 900,
    width: "100%",
    margin: "10px auto",
    padding: "12px 14px",
    borderRadius: 14,
    background: isUser ? "#1b2a44" : "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    whiteSpace: "pre-wrap",
    lineHeight: 1.4
  };
}

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div style={{ padding: "14px 12px 40px" }}>
      {messages.map((m, idx) => (
        <div key={idx} style={bubbleStyle(m.role)}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
            {m.role === "user" ? "You" : "Assistant"}
          </div>
          <div style={{ fontSize: 14 }}>{m.content || (m.role === "assistant" ? "…" : "")}</div>
        </div>
      ))}
    </div>
  );
}
