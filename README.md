# Voxora

Production-ready marketing website for an AI agency building AI Receptionists and AI Voice Agents for businesses.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Videos

Upload your MP4 demo videos to `public/videos/` with these filenames:

- `dental-receptionist.mp4`
- `law-firm-intake.mp4`
- `real-estate-leads.mp4`
- `after-hours.mp4`

Videos are configured in `src/lib/constants.ts` and will automatically appear in the demo section.

## Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

```bash
npm run build
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── layout/       # Navbar, Footer
│   ├── sections/     # Page sections
│   ├── ui/           # Reusable UI primitives
│   └── mockups/      # Dashboard & conversation mockups
├── lib/              # Constants, utils, animations
└── types/            # TypeScript types
```

## Customization

- **Brand name & copy**: `src/lib/constants.ts`
- **Colors & theme**: `src/app/globals.css`
- **SEO metadata**: `src/app/layout.tsx`
