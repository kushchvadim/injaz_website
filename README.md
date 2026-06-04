# SponsorSeek Demo

A sleek sponsorship connection platform that helps brands discover and support student projects and local competitions. Built for GITEX booth demo.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** (dark + neon-green palette)
- **Framer Motion** (micro-interactions)
- **shadcn/ui** (UI components)
- **Lucide React** (icons)

## Features

- Browse student projects and community competitions
- AI-powered SeekBot chat assistant
- Detailed opportunity modals
- Request to connect functionality
- Fully responsive design
- Accessibility-focused (keyboard navigation, focus rings, reduced motion support)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Build

```bash
npm run build
```

## Project Structure

```
├── app/
│   ├── page.tsx              # Home/Landing page
│   └── opportunities/
│       └── page.tsx          # Browse opportunities page
├── components/
│   ├── NavBar.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── OpportunityCard.tsx
│   ├── SeekBotChat.tsx
│   ├── DetailsModal.tsx
│   ├── RequestConnectModal.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── data.ts               # Mock data
└── public/
```

## Demo Notes

- Sponsorship data is static demo data, with SeekBot served through a Netlify Function
- Form submissions show success toast (no network calls)
- SeekBot chat calls the server-side Netlify Function at `/api/seekbot`
- Commission note is visual only

© 2025 SponsorSeek. Demo at GITEX.

## SeekBot backend manual test

The Netlify Function is exposed at `POST /api/seekbot` and expects `OPENAI_API_KEY` to be configured server-side. Optional environment variables are `SEEKBOT_MODEL` and `SEEKBOT_TIMEOUT_MS`.

```bash
# Run the Next.js site and Netlify Function locally
OPENAI_API_KEY=your_server_side_key npx netlify-cli dev

# In another terminal, call SeekBot through the Netlify Function
curl -X POST http://localhost:8888/api/seekbot \
  -H "Content-Type: application/json" \
  -d '{"message":"We are a bank targeting university students in Dubai with CSR goals","messages":[]}'
```

Expected response: HTTP 200 with JSON containing `reply`, `cards`, `suggested_questions`, and `meta`. Any returned card IDs should exist in `src/data/opportunities.json`.
