# GREEN-API Chat Application

A production-quality React chat application showcasing **strong frontend engineering** with GREEN-API (WhatsApp) integration.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Tests](https://img.shields.io/badge/Tests-Vitest-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
<img width="972" height="655" alt="изображение" src="https://github.com/user-attachments/assets/11640e45-1908-435d-9b2d-b2d2dd5881a9" />
<img width="1299" height="690" alt="изображение" src="https://github.com/user-attachments/assets/80feb677-9014-476f-945a-abbc99a9ed76" />

## Project Vision

**"Simple for the user, sophisticated under the hood."**

This is not just a working chat app — it's a **technical showcase** demonstrating:
- Clean React architecture
- TypeScript strict mode (no `any`)
- Optimistic UI patterns
- Real-time messaging with SSE
- Error recovery & retry logic
- Domain-driven design
- Professional UX/UI

## Features

### Core Functionality
- **Secure Authentication** — Connect with GREEN-API credentials
- **Text Messaging** — Send and receive messages in real-time
- **Optimistic UI** — Messages appear instantly, status updates seamlessly
- **Auto-Retry** — Failed messages can be retried with one click
- **Real-time Updates** — SSE (Server-Sent Events) for instant message delivery
- **Dark Mode** — Full dark/light theme support
- **Developer Mode** — Technical inspection panel for engineering review

### Technical Highlights
- **Optimistic Updates** — UI responds instantly, then syncs with server
- **Message Deduplication** — Prevents duplicate messages from notifications
- **Idempotent Operations** — Safe retry logic without side effects
- **Session Management** — Secure credential handling through backend
- **Type Safety** — TypeScript strict mode throughout
- **Clean Architecture** — Feature-oriented structure, domain models

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GREEN-API account ([console.green-api.com](https://console.green-api.com))

### Installation

```bash
# Clone repository
git clone <repo-url>
cd green-api-chat

# Install dependencies
npm install

# Start development servers (client + backend)
npm run dev
```

The application will open at:
- **Client**: http://localhost:5173
- **Backend API**: http://localhost:3000

### First-Time Setup

1. **Get GREEN-API Credentials**
   - Sign up at [console.green-api.com](https://console.green-api.com)
   - Create a new instance
   - Copy `idInstance` and `apiTokenInstance`

2. **Authorize Instance (Important!)**
   - In GREEN-API console, click "Scan QR code" for your instance
   - Scan with WhatsApp on your phone
   - Wait for status to change to "authorized"

3. **Connect in App**
   - Open http://localhost:5173
   - Enter your `idInstance` and `apiTokenInstance`
   - Click "Connect"
   - Start messaging!

## Project Structure

```
green-api-chat/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── app/                     # Application setup (router, providers)
│   │   ├── pages/                   # Page components
│   │   │   ├── ConnectPage/         # Authentication page
│   │   │   └── ChatPage/            # Main chat interface
│   │   ├── features/                # Feature modules
│   │   │   ├── connection/          # Connect to GREEN-API
│   │   │   ├── create-chat/         # Create new conversation
│   │   │   ├── send-message/        # Send with optimistic UI
│   │   │   └── receive-message/     # Real-time receiving via SSE
│   │   ├── entities/                # Domain models
│   │   │   ├── message/             # Message entity
│   │   │   └── chat/                # Chat entity
│   │   ├── widgets/                 # Composite UI components
│   │   │   ├── ChatHeader/
│   │   │   ├── ChatSidebar/
│   │   │   ├── MessageList/
│   │   │   ├── MessageComposer/
│   │   │   └── DeveloperPanel/      # Developer Mode UI
│   │   └── shared/                  # Shared utilities
│   │       ├── api/                 # API client layer
│   │       ├── ui/                  # UI primitives
│   │       ├── hooks/               # Custom hooks
│   │       └── lib/                 # Utilities
│   └── tests/                       # Test suites
│
└── server/                          # Backend adapter (Express + TypeScript)
    ├── src/
    │   ├── green-api/               # GREEN-API integration
    │   ├── services/                # Business logic
    │   ├── routes/                  # API endpoints
    │   └── middleware/              # Express middleware
    └── tests/                       # Backend tests
```

## Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript (strict mode)
- Vite — build tool
- TanStack Query — server state management
- Zustand — client state management
- React Hook Form + Zod — form handling
- Tailwind CSS — styling
- Vitest + React Testing Library — testing

**Backend:**
- Node.js + TypeScript
- Express — HTTP server
- Server-Sent Events (SSE) — real-time communication

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Minimal Backend** | Frontend test assignment focus |
| **SSE over WebSocket** | Unidirectional updates, simpler deployment |
| **TanStack Query** | Industry standard for server state |
| **Zustand over Redux** | Less boilerplate, sufficient for scope |
| **Feature-oriented Structure** | Scales better than type-based folders |
| **Domain Models** | Decouple UI from API specifics |
| **Optimistic UI** | Better perceived performance |
| **No Database** | Unnecessary complexity for demo |

### Message Lifecycle

**Outgoing Message:**
```
User types → Validation → Optimistic UI → Backend → GREEN-API → Update status
                    ↓
            [Message appears instantly with "sending" status]
                    ↓
            [Success: status → "sent" | Error: status → "failed" + Retry button]
```

**Incoming Message:**
```
WhatsApp → GREEN-API → Backend Poll (5s) → Parse → Deduplicate → SSE → React → UI
```

### State Management

**Server State (TanStack Query):**
- API calls with caching
- Optimistic updates
- Automatic retry
- Error handling

**Client State (Zustand):**
- Connection status
- Active chat ID
- Developer mode toggle
- Messages per chat
- Chat list

**Local State (useState):**
- Form inputs
- Modal visibility
- UI flags

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ConnectionForm.test.tsx
```

### Test Coverage

- **Unit Tests** — Utilities, hooks, domain logic
- **Component Tests** — Forms, UI components
- **Integration Tests** — User flows, API interactions

**Example tests:**
- `useSendMessage.test.ts` — Optimistic UI flow
- `ConnectionForm.test.tsx` — Form validation
- `format.test.ts` — Pure functions

## Developer Mode

Toggle with Settings icon in header or press `Ctrl+Shift+D`

**Features:**
- **Statistics** — Total chats, messages, pending, failed
- **Connection Monitor** — Session status, SSE state
- **Message Inspector** — Last 5 messages with technical details
- **Architecture Info** — Tech stack, design patterns
- **Real-time Activity** — Message lifecycle tracking

Perfect for technical review and debugging!

## UI/UX Features

- **Responsive Design** — Works on desktop, tablet, mobile
- **Dark Mode** — System preference + manual toggle
- **Accessibility** — ARIA labels, keyboard navigation
- **Loading States** — Spinners, skeleton screens
- **Empty States** — Helpful messages when no data
- **Error Recovery** — Clear error messages with retry options
- **Optimistic UI** — Instant feedback, smooth experience
- **Auto-scroll** — Smart message list behavior
- **Status Indicators** — Message states (sending/sent/failed)

## Security

- Credentials **never** stored in localStorage
- All API calls routed through backend
- Session-based authentication
- No sensitive data in client-side code
- CORS configured properly
- `.env.example` for safe configuration

## Performance

- Memoized components to prevent unnecessary re-renders
- Debounced inputs
- Efficient state updates
- Code splitting ready
- Optimized bundle size

## Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start only React app
npm run dev:server       # Start only backend

# Building
npm run build           # Build both client and server
npm run build:client    # Build React app
npm run build:server    # Build backend

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode

# Type Checking
npm run typecheck       # Check TypeScript types
npm run lint            # Run ESLint
```

## Troubleshooting

### "Invalid credentials or GREEN-API is unavailable"
- Check credentials in [GREEN-API console](https://console.green-api.com)
- Ensure instance is active (not blocked/suspended)
- Verify `apiTokenInstance` is complete

### "Instance not authorized"
- Open GREEN-API console
- Click "Scan QR code" for your instance
- Scan with WhatsApp
- Wait for "authorized" status
- Try connecting again

### Messages not receiving
- Check "Live" badge in header (SSE status)
- Look for connection errors in Developer Mode
- Verify backend is running on port 3000
- Check browser console for errors

## Success Criteria

This project demonstrates:

**Architecture** — Clean separation of concerns, typed boundaries  
**React Skills** — Proper hooks, composition, state management  
**Async Mastery** — Optimistic updates, error handling, retry logic  
**UX Attention** — Loading states, errors, empty states, responsive  
**Real-time** — Working SSE, deduplication, message streaming  
**Testing** — Unit, component, and integration tests  
**Code Quality** — TypeScript strict, no `any`, consistent style  
**Documentation** — Clear README, runnable with minimal setup  

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Detailed architecture documentation
- **[API Documentation](./server/README.md)** — Backend API reference
- **[Contributing Guide](./CONTRIBUTING.md)** — Development guidelines


## License

MIT License - feel free to use this code for learning purposes.

## Acknowledgments

- [GREEN-API](https://green-api.com/) for WhatsApp Business API
- [React](https://react.dev/) team for React 19
- [TanStack](https://tanstack.com/) for excellent state management tools
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS

---

**Built as a technical showcase**

For questions or technical discussion, open an issue or reach out!
