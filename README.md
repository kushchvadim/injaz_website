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
- AI-powered SeekBot filter assistant
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
│   ├── SeekBotPanel.tsx
│   ├── DetailsModal.tsx
│   ├── RequestConnectModal.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── data.ts               # Mock data
└── public/
```

## Demo Notes

- All data is mocked (no backend)
- Form submissions show success toast (no network calls)
- SeekBot filtering is frontend tag-based
- Commission note is visual only

© 2025 SponsorSeek. Demo at GITEX.
