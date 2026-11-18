# Agent Chat Widget (`agent-chat-widget`)

> A modern, customizable floating AI Agent Chat Widget for web applications. Opens a chat window on click and connects seamlessly to your AI agent backend (supports streaming SSE, standard REST, and custom handlers).

Works out-of-the-box with **React**, **Next.js**, **Vite**, and **Vanilla HTML / JavaScript**.

---

## ✨ Features

- 🚀 **Click-to-Open Floating Launcher**: Sleek floating action button (bottom-right, bottom-left, etc.) with animated open/close states and optional notification badges.
- ⚡ **Streaming & REST Support**: Compatible with chunked streaming (Server-Sent Events / SSE), standard JSON REST APIs, and OpenAI-compatible endpoints.
- 🎨 **Fully Customizable Theme**: Adjust brand colors, bubble colors, border radius, dimensions, fonts, and positions via simple props.
- 🔌 **Pluggable Sender**: Connect via standard HTTP `apiEndpoint` or plug in your own `customSendMessage` handler for WebSockets, LangChain, or custom SDKs.
- 🧠 **Markdown & Link Formatting**: Lightweight safe formatting for bold text, inline code, bullet points, and links without bulky external dependencies.
- 💾 **Session Persistence**: Optional persistence across page reloads using browser session storage.
- 💡 **Quick Suggested Prompts**: Display starter chips/questions to help users start chatting immediately.
- 📦 **Dual Mode**: Use as a React component `<AgentChatWidget />` or via Vanilla JS embed `initAgentChat()`.
- 🛡️ **Zero External CSS Dependency**: Self-contained inline styles with auto-injected keyframes — no Tailwind or CSS config required.

---

## 📦 Installation

```bash
npm install agent-chat-widget
# or
yarn add agent-chat-widget
# or
pnpm add agent-chat-widget
```

---

## 🚀 Quick Start (React)

```tsx
import React from 'react';
import { AgentChatWidget } from 'agent-chat-widget';

export default function App() {
  return (
    <div>
      <h1>My Application</h1>

      {/* Floating AI Agent Chat Widget */}
      <AgentChatWidget
        apiEndpoint="https://api.yourbackend.com/agent/chat"
        agentName="Support Agent"
        agentSubtitle="🟢 Online • Powered by AI"
        welcomeMessage="Hi there! How can I help you today?"
        suggestedPrompts={[
          "What is my claim status?",
          "How do I submit a new claim?",
          "Speak to a human representative"
        ]}
        theme={{
          primaryColor: '#2563eb',
          position: 'bottom-right',
        }}
      />
    </div>
  );
}
```

---

## 🌐 Quick Start (Vanilla HTML / Script Tag)

Add the script to your HTML and call `AgentChat.init`:

```html
<!-- Load Widget Script -->
<script src="https://unpkg.com/agent-chat-widget/dist/agent-chat-widget.umd.js"></script>

<script>
  AgentChat.initAgentChat({
    apiEndpoint: 'https://api.yourbackend.com/agent/chat',
    agentName: 'Support Assistant',
    welcomeMessage: 'Hello! How can I assist you?',
    theme: {
      primaryColor: '#10b981',
      position: 'bottom-right'
    }
  });
</script>
```

---

## 🔌 Backend Contract & Examples

By default, the widget issues an `HTTP POST` request to `apiEndpoint` with the following JSON payload:

### Request Payload sent to Backend:
```json
{
  "message": "Where is my order?",
  "messages": [
    { "role": "assistant", "content": "Hello! How can I help you?" },
    { "role": "user", "content": "Where is my order?" }
  ],
  "agentId": "support-bot-1",
  "userId": "user-4819",
  "conversationId": "conv-10293",
  "metadata": { "plan": "pro" }
}
```

### Backend Response Options:

The widget automatically handles any of the following standard response shapes:

#### 1. Standard JSON (Node.js / Express / FastAPI)
Return any of: `{ "reply": "..." }`, `{ "message": "..." }`, `{ "content": "..." }`, or `{ "choices": [{ "message": { "content": "..." } }] }`:

```js
// Express / Node.js
app.post('/api/chat', async (req, res) => {
  const { message, messages } = req.body;

  // Call your AI model (Gemini, Claude, OpenAI, Ollama, LangChain, etc.)
  const agentResponse = await myAgent.generateReply(message);

  res.json({ reply: agentResponse });
});
```

```python
# FastAPI / Python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    messages: list

@app.post("/api/chat")
async def chat_handler(req: ChatRequest):
    bot_reply = await run_ai_agent(req.message)
    return {"reply": bot_reply}
```

#### 2. Streaming Responses (SSE / Chunked Stream)
When `streaming: true` is passed to the widget:
```js
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await myAgent.streamReply(req.body.message);
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
```

---

## 🛠️ Configuration Props (`AgentChatWidgetProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiEndpoint` | `string` | `'/api/chat'` | URL endpoint to receive POST chat requests. |
| `headers` | `object \| () => Promise<object>` | `{}` | Custom HTTP headers (e.g. `Authorization`). |
| `agentId` | `string` | `undefined` | Agent ID passed in request payload. |
| `userId` | `string` | `undefined` | User ID passed in request payload. |
| `conversationId` | `string` | `undefined` | Conversation identifier for backend session routing. |
| `metadata` | `object` | `undefined` | Additional payload metadata for backend. |
| `welcomeMessage` | `string` | `'Hello! How can I help you today?'` | Initial greeting displayed by the agent. |
| `agentName` | `string` | `'AI Assistant'` | Name displayed in the header. |
| `agentSubtitle` | `string` | `'Online'` | Subtitle under agent name. |
| `agentAvatar` | `string \| ReactNode` | Bot SVG | URL to image or custom React component. |
| `placeholder` | `string` | `'Ask a question...'` | Input placeholder text. |
| `buttonLabel` | `string` | `undefined` | Optional pill label next to launcher button. |
| `showBadge` | `boolean` | `false` | Shows red unread notification badge on button. |
| `streaming` | `boolean` | `false` | Enables streaming mode (SSE / ReadableStream). |
| `persistSession` | `boolean` | `false` | Stores chat history in browser `sessionStorage`. |
| `suggestedPrompts` | `string[]` | `[]` | Quick question chips displayed in conversation. |
| `theme` | `ChatTheme` | `{}` | Theme customization object (see below). |
| `customSendMessage` | `function` | `undefined` | Custom sender function for WebSockets or SDKs. |
| `isOpen` | `boolean` | `undefined` | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial uncontrolled open state. |
| `onToggle` | `(isOpen: boolean) => void` | `undefined` | Fired when chat window opens or closes. |
| `onMessageSent` | `(msg: ChatMessage) => void` | `undefined` | Callback after user sends a message. |
| `onMessageReceived` | `(msg: ChatMessage) => void` | `undefined` | Callback after agent responds. |
| `onError` | `(err: Error) => void` | `undefined` | Callback when backend request fails. |

---

## 🎨 Theme Customization (`theme`)

```tsx
<AgentChatWidget
  theme={{
    primaryColor: '#7c3aed',         // Header and send button background
    headerTextColor: '#ffffff',      // Header text color
    userBubbleBg: '#7c3aed',         // User message bubble background
    userBubbleColor: '#ffffff',      // User message text color
    agentBubbleBg: '#f3f4f6',        // Agent message bubble background
    agentBubbleColor: '#111827',     // Agent message text color
    borderRadius: '20px',            // Window corner radius
    width: '400px',                  // Window width
    height: '600px',                 // Window height
    position: 'bottom-right',        // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    zIndex: 99999,                   // Window z-index
  }}
/>
```

---

## 🧩 Advanced: Headless Hook (`useAgentChat`)

If you want to design your own custom chat UI while reusing the robust streaming and backend connection logic:

```tsx
import { useAgentChat } from 'agent-chat-widget';

export function CustomChat() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAgentChat({
    apiEndpoint: '/api/agent',
  });

  return (
    <div>
      {messages.map((m) => (
        <p key={m.id}><b>{m.role}:</b> {m.content}</p>
      ))}
      {isLoading && <p>Agent is typing...</p>}
      <button onClick={() => sendMessage("Hello!")}>Send</button>
    </div>
  );
}
```

---

## 🚢 Publishing to NPM

1. Log in to your npm account:
   ```bash
   npm login
   ```
2. Build the package:
   ```bash
   npm run build
   ```
3. Publish:
   ```bash
   npm publish --access public
   ```

---

## 📄 License

MIT
