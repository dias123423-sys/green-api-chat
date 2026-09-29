# Quick Start Guide

## Repository

**GitHub:** https://github.com/dias123423-sys/green-api-chat

## Setup

```bash
# Clone repository
git clone https://github.com/dias123423-sys/green-api-chat.git
cd green-api-chat

# Install dependencies
npm install

# Start development servers (both client and server)
npm run dev
```

## Access

- **Client:** http://localhost:5173
- **Server API:** http://localhost:3000

## First Steps

1. **Authorize GREEN-API Instance**
   - Go to https://console.green-api.com
   - Find instance: `7201227508474`
   - Click "Scan QR code"
   - Scan with WhatsApp
   - Wait for "authorized" status

2. **Connect in App**
   - Open http://localhost:5173
   - Enter credentials:
     - ID Instance: `7201227508474`
     - API Token: `977522c8edbc4417bde0aa9e3df8786ec1bbb7b71ab94c0d97`
   - Click "Connect"

3. **Test Messaging**
   - Click "+ New Chat"
   - Enter phone number (format: 79XXXXXXXXX)
   - Send and receive messages

4. **Explore Developer Mode**
   - Click Settings button (gear icon)
   - View technical details and system info

## Key Features

- Optimistic UI - messages appear instantly
- Real-time updates via SSE
- Retry failed messages
- Dark mode support
- Developer Mode for technical inspection

## Project Structure

- `/client` - React frontend (Vite + TypeScript)
- `/server` - Express backend adapter
- `README.md` - Full documentation
- `ARCHITECTURE.md` - Technical details

## Commands

```bash
# Development
npm run dev              # Start both services
npm run dev:client       # Client only
npm run dev:server       # Server only

# Build
npm run build           # Build production

# Type checking
npm run typecheck       # Validate TypeScript

# Testing
npm test                # Run tests
```

## Troubleshooting

**"Instance not authorized"**
- Scan QR code in GREEN-API console first

**Messages not receiving**
- Check "Live" badge in header
- Verify backend is running (port 3000)

**TypeScript errors**
- Run `npm run typecheck` to validate
- All code is strictly typed (zero `any`)

## Tech Stack

- React 19 + TypeScript (strict)
- TanStack Query + Zustand
- Tailwind CSS
- Express + SSE
- Vite + Vitest

## What Makes This Special

This is not just a working chat app - it's an **engineering showcase**:

- Clean architecture with domain models
- Optimistic UI patterns
- Real-time SSE implementation
- Comprehensive error handling
- Developer Mode for transparency
- Production-quality code organization
- Zero technical debt

Perfect for technical interviews and portfolio!
