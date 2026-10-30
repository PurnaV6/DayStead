# Daystead by Provifi

Your day, in order. A UK app that puts bill reminders with "money needed before payday", medication reminders and appointments in one place. 1 month free, then £3.99/month or £35.99/year.

New here? Read [HANDOFF.md](HANDOFF.md) first.

| Folder | What it is |
|---|---|
| `mobile/` | The iOS/Android app (Expo + Supabase). This is what ships to the stores. See `mobile/README.md`. |
| `web/` | The website on Vercel, deployed automatically from `main`: https://web-mwdx.vercel.app |
| `supabase/` | Edge functions (account deletion, owner metrics, RevenueCat webhook) and SQL changes for the live database. |
| `release/` | Launch status, blockers and store setup ([release/LAUNCH.md](release/LAUNCH.md)). |
| `research/` | Market research. |

## Checks before every pull request

```bash
cd mobile && npm ci && npm run typecheck && npm run lint && TZ=Europe/London npm test
cd web && npm ci && npx tsc --noEmit && npx vite build
```

Work on a branch and open a pull request; do not push to `main`.
