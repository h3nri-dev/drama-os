# Drama OS (Nekoi Studio)

## Project Overview
Interactive drama production platform. Writers create multi-episode dramas with AI-powered story generation, visual novel panels, character bibles, and multi-platform publishing.

## Architecture
- **Frontend**: Vite + React (single large App.jsx + LandingWrapper.jsx)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Supabase Auth (email/password, session persistence)
- **Deployment**: Vercel (static SPA)

## Database (Supabase: xlsywqwmzkvncdphyffy)
Tables: profiles, projects, bibles, episodes, assets, project_members, platform_credentials, pricing, subscribers, subscriptions, publish_jobs, vn_images

Key relationships:
- projects.id → episodes.project_id, bibles.project_id, assets.project_id
- auth.users.id → profiles.id

## Environment Variables
- VITE_SUPABASE_URL — Supabase project URL
- VITE_SUPABASE_ANON_KEY — Supabase anon key
- SUPABASE_SERVICE_ROLE_KEY — for server-side operations

IMPORTANT: Use import.meta.env.VITE_* prefix (Vite, not Next.js).
NEVER hardcode Supabase URLs or keys — always use env vars.
NEVER use localStorage for credentials — only for user preferences/state cache.

## Supabase Client
App.jsx uses a lazy loader via window.__supabaseCreateClient (set in main.jsx).
Must use persistSession: true for the auth session to carry over from LandingWrapper to App.

## Key Files
- src/main.jsx — entry point, exposes Supabase createClient to window
- src/LandingWrapper.jsx — landing page, auth gate, waitlist
- src/App.jsx — main application (14K+ lines, monolithic)
- vercel.json — SPA routing config

## Production
- URL: https://drama-os.vercel.app
- Vercel project: prj_U6v2BRULJxQlNyzAIQZif3jjAz8R
- Git: h3nri-dev/drama-os
- Supabase: xlsywqwmzkvncdphyffy

## LLM Integration
User-provided API keys stored in app state (not in Supabase):
- Claude (Anthropic): for story generation, character development
- Gemini: for image generation (VN panels)
- OpenAI DALL-E: alternative image generation
- ElevenLabs: for audiobook TTS

Keys are entered by the user in Settings, stored in localStorage (ds_state, ds_gemini).
No server-side LLM calls — all client-side.

## Common Pitfalls
- App.jsx is 14K+ lines — be careful with merge conflicts
- Multiple workers modifying App.jsx will always conflict
- The Supabase client in App.jsx MUST have persistSession: true
- RLS policies require authenticated user — test with auth, not anon
