# GREEN-API Chat — Architecture Document

## Project Vision

Build a production-quality React chat application that demonstrates **strong frontend engineering**, not just feature completion. This is a technical showcase emphasizing:

- Clean React architecture
- TypeScript strict mode
- Sophisticated state management
- Optimistic UI patterns
- Real-time message handling
- Error recovery and retry logic
- Message lifecycle visibility
- Professional UX

## Core Principle

**"Simple for the user, sophisticated under the hood."**

The end user sees a clean, modern messenger interface. The technical reviewer sees well-architected, maintainable, and testable code.

## Tech Stack Rationale

### Frontend

| Technology | Purpose | Why |
|------------|---------|-----|
| **React 19+** | UI framework | Industry standard, component composition, hooks ecosystem |
| **TypeScript** | Type safety | Catch errors at compile time, better DX, self-documenting code |
| **Vite** | Build tool | Fast dev server, optimized builds, better than CRA |
| **Tailwind CSS** | Styling | Utility-first, consistent design system, dark mode support |
| **React Router** | Routing | Standard solution for SPA navigation |
| **TanStack Query** | Server state | Caching, retry, optimistic updates, request deduplication |
| **Zustand** | Client state | Lightweight, no boilerplate, perfect for UI state |
| **React Hook Form** | Forms | Performant, great DX, minimal re-renders |
| **Zod** | Validation | Type-safe schema validation, works with RHF |
| **Lucide React** | Icons | Consistent iconography, tree-shakeable |

### Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Test runner |
| **React Testing Library** | Component testing |
| **MSW** | API mocking |

### Backend Adapter

| Technology | Purpose |
|------------|---------|
| **Node.js + TypeScript** | Runtime |
| **Express** | HTTP server |

The backend is intentionally minimal — just a secure adapter between React and GREEN-API.

## Project Structure

```
green-api-chat/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── app/                     # Application configuration
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── ConnectPage/
│   │   │   └── ChatPage/
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── connection/          # Connect to GREEN-API
│   │   │   ├── create-chat/         # Create new conversation
│   │   │   ├── send-message/        # Send with optimistic UI
│   │   │   ├── receive-message/     # Real-time receiving
│   │   │   └── developer-mode/      # Dev panel & inspector
│   │   │
│   │   ├── entities/                # Domain models
│   │   │   ├── message/
│   │   │   │   ├── types.ts
│   │   │   │   ├── model.ts
│   │   │   │   └── hooks.ts
│   │   │   └── chat/
│   │   │       ├── types.ts
│   │   │       └── hooks.ts
│   │   │
│   │   ├── widgets/                 # Composite UI blocks
│   │   │   ├── ChatSidebar/
│   │   │   ├── ChatHeader/
│   │   │   ├── MessageList/
│   │   │   ├── MessageComposer/
│   │   │   └── DeveloperPanel/
│   │   │
│   │   └── shared/                  # Shared utilities
│   │       ├── api/                 # API client layer
│   │       │   ├── client.ts
│   │       │   ├── types.ts
│   │       │   └── hooks.ts
│   │       ├── ui/                  # UI primitives
│   │       │   ├── Button.tsx
│   │       │   ├── Input.tsx
│   │       │   ├── Card.tsx
│   │       │   └── Modal.tsx
│   │       ├── hooks/               # Shared hooks
│   │       ├── lib/                 # Utilities
│   │       └── config/              # Constants
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── mocks/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                          # Backend adapter
│   ├── src/
│   │   ├── green-api/              # GREEN-API integration
│   │   │   ├── client.ts           # API calls
│   │   │   ├── types.ts            # GREEN-API DTOs
│   │   │   ├── parser.ts           # Notification parsing
│   │   │   └── validator.ts        # Response validation
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── message.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   ├── routes/                 # API endpoints
│   │   │   ├── connection.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   └── events.routes.ts    # SSE endpoint
│   │   │
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── README.md
└── ARCHITECTURE.md
```

## Architecture Layers

### 1. Presentation Layer (React Components)

**Responsibility:** Render UI, handle user interaction, manage local UI state

```
User Input → Component → Hook → API/State → Re-render
```

### 2. State Management Layer

**Server State (TanStack Query):**
- Messages
- Connection status
- API calls
- Cache management

**Client State (Zustand):**
- Active chat ID
- Developer mode toggle
- UI preferences
- Connection credentials (session only)

**Local State (useState):**
- Form inputs
- Modal visibility
- Temporary UI flags

### 3. API Layer

**Frontend API Client:**
```typescript
// Clean domain-oriented API
api.connection.test(credentials)
api.chats.create(phoneNumber)
api.messages.send(chatId, text)
api.events.subscribe()
```

**Backend Adapter:**
- Securely stores credentials
- Transforms GREEN-API DTOs to domain models
- Handles notification polling
- Broadcasts events via SSE

### 4. Domain Layer

**Domain Models:**
```typescript
Message → Not GREEN-API response object
Chat → Not GREEN-API chat object
ActivityEvent → Internal event system
```

This separation means:
- UI is decoupled from GREEN-API specifics
- Easy to test with mocks
- Can switch messaging provider without rewriting UI

## Message Lifecycle

### Outgoing Message Flow

```
User types → Validation → Optimistic UI → Backend → GREEN-API → Update status
```

**Detailed steps:**

1. **User Input**
   - Validate: not empty, max length
   - Disable send if invalid

2. **Optimistic Creation**
   ```typescript
   const tempMessage: Message = {
     id: generateTempId(),
     clientId: uuid(),
     chatId,
     text,
     direction: 'outgoing',
     status: 'sending',
     createdAt: new Date().toISOString()
   }
   ```

3. **Render Immediately**
   - Show message bubble with "sending" indicator
   - Don't block composer
   - User can continue typing

4. **API Call**
   ```typescript
   const response = await api.messages.send(chatId, text)
   ```

5. **Success**
   ```typescript
   updateMessage(tempMessage.id, {
     id: response.idMessage,
     status: 'sent'
   })
   ```

6. **Failure**
   ```typescript
   updateMessage(tempMessage.id, {
     status: 'failed',
     error: response.error
   })
   ```

### Incoming Message Flow

```
WhatsApp → GREEN-API → Backend Poll → Parse → Deduplicate → SSE → React → UI
```

**Detailed steps:**

1. **Backend Polling**
   ```typescript
   // Every 5 seconds
   const notification = await greenApi.receiveNotification()
   ```

2. **Parse & Validate**
   ```typescript
   if (notification.body.typeWebhook === 'incomingMessageReceived') {
     const message = parseIncomingMessage(notification)
   }
   ```

3. **Deduplication**
   ```typescript
   if (isAlreadyProcessed(notification.receiptId)) {
     return
   }
   markAsProcessed(notification.receiptId)
   ```

4. **Convert to Domain Model**
   ```typescript
   const domainMessage: Message = {
     id: notification.receiptId,
     clientId: uuid(),
     chatId: extractChatId(notification),
     text: notification.body.messageData.textMessageData.textMessage,
     direction: 'incoming',
     status: 'received',
     createdAt: new Date().toISOString()
   }
   ```

5. **Broadcast via SSE**
   ```typescript
   sseClients.forEach(client => {
     client.send({
       type: 'message.received',
       data: domainMessage
     })
   })
   ```

6. **Delete Notification**
   ```typescript
   await greenApi.deleteNotification(notification.receiptId)
   ```

7. **React Receives Event**
   ```typescript
   useMessageStream(chatId, (message) => {
     queryClient.setQueryData(['messages', chatId], (old) => {
       return [...old, message]
     })
   })
   ```

## Real-time Communication

### SSE (Server-Sent Events)

**Why SSE over polling?**
- More efficient than client polling
- Built-in reconnection
- Server-controlled push
- Simple HTTP-based

**Why SSE over WebSocket?**
- Unidirectional (we only need server → client)
- Simpler to deploy
- Works through proxies
- No need for full-duplex

**Implementation:**

```typescript
// Server
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const clientId = addClient(res)
  
  req.on('close', () => {
    removeClient(clientId)
  })
})

// Client
const eventSource = new EventSource('/api/events')

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data)
  handleIncomingMessage(message)
}
```

## State Synchronization

### Problem: Duplicate Messages

**Scenario:**
1. Notification arrives
2. We process it → UI shows message
3. Backend crashes before deleting notification
4. Backend restarts
5. Same notification arrives again
6. Without protection → duplicate message in UI

**Solution: Idempotent Processing**

```typescript
// In-memory cache (could be Redis in production)
const processedNotifications = new Set<string>()

function processNotification(notification: GreenApiNotification) {
  const id = notification.receiptId
  
  if (processedNotifications.has(id)) {
    console.log('Duplicate notification, skipping')
    return
  }
  
  processedNotifications.add(id)
  
  // Process...
  
  // Clean old entries to prevent memory leak
  if (processedNotifications.size > 1000) {
    // Remove oldest...
  }
}
```

### Problem: Optimistic Update Conflicts

**Scenario:**
1. User sends message → optimistic UI (temp ID: `temp-123`)
2. Server responds → real ID: `msg-456`
3. Now we have two messages in state?

**Solution: Replace Strategy**

```typescript
// When sending
const tempId = `temp-${Date.now()}`
addOptimisticMessage({ id: tempId, status: 'sending', ... })

// When response arrives
const realId = response.idMessage
replaceMessage(tempId, { id: realId, status: 'sent' })
```

## Error Handling System

### Error Types

```typescript
type ErrorType = 
  | 'validation'      // User input error
  | 'network'         // Connection lost
  | 'api'             // GREEN-API rejected
  | 'auth'            // Invalid credentials
  | 'unknown'         // Unexpected error

interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  retryable: boolean
  technicalDetails?: unknown
}
```

### Error Recovery

**Network Error → Auto Retry**
```typescript
queryClient.setDefaultOptions({
  queries: {
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  }
})
```

**Failed Message → Manual Retry**
```typescript
<MessageBubble message={message}>
  {message.status === 'failed' && (
    <RetryButton onClick={() => retryMessage(message.id)} />
  )}
</MessageBubble>
```

**Connection Lost → Reconnect**
```typescript
useEffect(() => {
  const reconnect = () => {
    if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
      connectToEventStream()
    }
  }
  
  const interval = setInterval(reconnect, 5000)
  return () => clearInterval(interval)
}, [])
```

## Developer Mode

### Purpose

Provide visibility into the system's internal workings for technical evaluation without cluttering the user interface.

### Features

**1. Connection Monitor**
- GREEN-API status
- API latency
- Receiving status
- Last poll time

**2. Activity Timeline**
```typescript
interface ActivityEvent {
  id: string
  type: 'message.created' | 'message.sent' | 'message.failed' | 
        'notification.received' | 'notification.processed' |
        'connection.connected' | 'connection.disconnected'
  timestamp: string
  messageId?: string
  durationMs?: number
  metadata?: Record<string, unknown>
}
```

**3. Message Inspector**

For any message, show:
- Message ID
- Client ID (for tracking)
- Chat ID
- Direction
- Status
- Created timestamp
- Processing time
- Full lifecycle:
  - Message created
  - Optimistic UI rendered
  - API request sent
  - GREEN-API response received
  - Message confirmed

**4. API Inspector**

For debugging API calls:
- Request method/URL
- Status code
- Latency
- Request body (sensitive fields redacted)
- Response body (sensitive fields redacted)

### Implementation

```typescript
// Zustand store
interface DeveloperStore {
  enabled: boolean
  activities: ActivityEvent[]
  selectedMessage: string | null
  
  addActivity: (event: ActivityEvent) => void
  selectMessage: (id: string) => void
  toggle: () => void
}

// Usage in features
const logActivity = useDeveloperStore(state => state.addActivity)

// After sending message
logActivity({
  type: 'message.sent',
  timestamp: new Date().toISOString(),
  messageId: message.id,
  durationMs: performance.now() - startTime
})
```

## Security Considerations

### Credentials Storage

**❌ Don't:**
- Store `apiTokenInstance` in localStorage
- Send token from React directly to GREEN-API
- Commit real credentials to Git
- Log sensitive data

**✅ Do:**
- Keep credentials in memory (session only)
- Route all requests through backend
- Use `.env.example` with dummy values
- Redact sensitive fields in Developer Mode

### Backend Adapter Security

```typescript
// Store credentials per session
const sessions = new Map<string, GreenApiCredentials>()

// Middleware
const authenticate = (req, res, next) => {
  const sessionId = req.headers['x-session-id']
  if (!sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  req.credentials = sessions.get(sessionId)
  next()
}
```

### CORS Configuration

```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
```

## Performance Considerations

### Rendering Optimization

**Problem:** Re-rendering entire message list on every new message

**Solution:**
```typescript
// Memoize individual message bubbles
const MessageBubble = memo(({ message }: Props) => {
  // ...
}, (prev, next) => {
  return prev.message.status === next.message.status &&
         prev.message.text === next.message.text
})

// Keep composer independent
const MessageComposer = () => {
  // Local state only, doesn't re-render when messages change
  const [text, setText] = useState('')
}
```

### Message List Virtualization

**When to add:** If message list grows beyond ~100 items and performance degrades

**Library:** `@tanstack/react-virtual`

Not adding initially to avoid premature optimization.

### Query Invalidation Strategy

```typescript
// After sending message → optimistic update (no refetch)
await sendMessage.mutate(data, {
  onSuccess: () => {
    // Don't invalidate, we already updated optimistically
  }
})

// After receiving message → direct cache update (no refetch)
queryClient.setQueryData(['messages', chatId], (old) => {
  return [...old, newMessage]
})
```

## Testing Strategy

### Unit Tests

**What to test:**
- Utilities (phone validation, date formatting)
- Custom hooks (useMessageStream, useOptimisticUpdate)
- Domain logic (message deduplication, status transitions)

### Integration Tests

**What to test:**
- Connect flow
- Send message flow
- Receive message flow
- Retry failed message
- Developer mode toggle

### Component Tests

**What to test:**
- Form validation
- Button states
- Error display
- Empty states
- Loading states

### MSW Mocks

```typescript
// Mock GREEN-API responses
export const handlers = [
  rest.post('/api/messages', (req, res, ctx) => {
    return res(
      ctx.json({
        idMessage: 'msg-123',
        timestamp: Date.now()
      })
    )
  }),
  
  rest.get('/api/events', (req, res, ctx) => {
    // Mock SSE
  })
]
```

## Accessibility

### Keyboard Navigation

- `Tab` → Navigate between elements
- `Enter` → Send message
- `Shift + Enter` → New line
- `Escape` → Close modal/developer panel
- `Ctrl/Cmd + Shift + D` → Toggle developer mode

### Screen Reader Support

```tsx
<button 
  aria-label="Send message"
  aria-disabled={!canSend}
>
  <SendIcon />
</button>

<div role="log" aria-live="polite" aria-atomic="false">
  {/* New messages announced */}
</div>
```

### Focus Management

```typescript
// After opening modal
useEffect(() => {
  if (isOpen) {
    firstInputRef.current?.focus()
  }
}, [isOpen])

// After sending message
useEffect(() => {
  if (justSent) {
    composerRef.current?.focus()
  }
}, [justSent])
```

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large desktop
}
```

### Layout Strategy

**Desktop (≥1024px):**
```
┌────────────────────────────────────┐
│ Header                             │
├──────────┬─────────────────────────┤
│          │                         │
│ Sidebar  │  Chat                   │
│          │                         │
└──────────┴─────────────────────────┘
```

**Tablet (768px - 1023px):**
```
┌────────────────────────────────────┐
│ Header                    [☰]      │
├────────────────────────────────────┤
│                                    │
│  Chat (sidebar collapsible)        │
│                                    │
└────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌──────────────┐
│ Header       │
├──────────────┤
│              │
│ Chat List    │  or  │ Messages │
│              │      │          │
└──────────────┘      └──────────┘
     Screen 1            Screen 2
```

## Deployment

### Docker Setup

```yaml
version: '3.8'

services:
  frontend:
    build: ./client
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
```

### Environment Variables

**Client `.env.example`:**
```
VITE_API_URL=http://localhost:3000
```

**Server `.env.example`:**
```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SESSION_SECRET=change-me-in-production
```

## Known Limitations

1. **No Persistence:** Messages lost on page refresh (by design for test assignment)
2. **Single User:** No multi-user support
3. **No Media:** Text messages only
4. **No Groups:** 1-on-1 chats only
5. **Session Storage:** Credentials not persisted (security trade-off)
6. **Polling Interval:** 5s delay for receiving (GREEN-API HTTP limitation)

## Future Enhancements (Out of Scope)

- Message persistence (IndexedDB/Backend DB)
- Media messages (images, files)
- Message reactions
- Typing indicators
- Read receipts
- Message search
- Export chat history
- Multiple accounts
- Group chats

## Engineering Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Minimal backend | Frontend test assignment focus |
| No database | Unnecessary complexity for demo |
| SSE over polling | More efficient, better UX |
| TanStack Query | Industry-standard server state management |
| Zustand over Redux | Less boilerplate, sufficient for scope |
| TypeScript strict | Catch errors early, better DX |
| Feature-oriented structure | Scales better than type-based folders |
| Domain models | Decouple UI from API specifics |
| Optimistic UI | Better perceived performance |
| Developer mode | Showcase engineering without cluttering UX |

## Success Criteria

This project succeeds if a technical reviewer can see:

**Architecture:** Clean separation of concerns, typed boundaries
**React Skills:** Proper hooks, composition, state management
**Async Mastery:** Optimistic updates, error handling, retry logic
**UX Attention:** Loading states, errors, empty states, responsive
**Real-time:** Working SSE, deduplication, message streaming
**Testing:** Meaningful tests, not just coverage
**Code Quality:** TypeScript strict, no `any`, consistent style
**Documentation:** Clear README, runnable with minimal setup

**The goal is not to build every feature possible, but to demonstrate production-level thinking in a focused scope.**
