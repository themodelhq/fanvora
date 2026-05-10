# Fanvora PWA

A creator subscription platform — now as a **Progressive Web App (PWA)** — deployable with a **Netlify frontend** and **Render backend**.

---

## PWA Features Added

| Feature | Details |
|---|---|
| **Service Worker** | Caches static assets, enables offline fallback, handles push notifications |
| **Web App Manifest** | Full install metadata, icons, shortcuts, theme color |
| **Install Prompt** | "Add to Home Screen" banner on Android/Chrome |
| **Offline Banner** | Notifies users when offline |
| **Update Notification** | Prompts users when a new version is deployed |
| **App Icons** | All sizes: 72×72 → 512×512 (maskable) |
| **Apple/iOS Support** | apple-mobile-web-app-capable + status bar meta |

---

## Project Structure

```
fanvora/
├── frontend/          ← React + Vite + Tailwind (deploys to Netlify)
│   ├── public/
│   │   ├── manifest.json   ← PWA manifest
│   │   ├── sw.js           ← Service worker
│   │   └── icons/          ← App icons (all sizes)
│   ├── src/
│   │   ├── hooks/usePWA.js         ← SW registration + install logic
│   │   └── components/PWABanners.jsx ← Offline/Install/Update UI
│   └── netlify.toml   ← Netlify build + headers config
├── backend/           ← Express API (deploys to Render)
│   ├── src/
│   │   ├── index.js
│   │   └── routes/
│   ├── .env.example
│   └── Dockerfile
├── render.yaml        ← Render deployment config
└── README.md
```

---

## Deploy to Netlify (Frontend)

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://fanvora-api.onrender.com`)
5. Click **Deploy**

The `netlify.toml` handles SPA routing and all PWA-required headers automatically.

---

## Deploy to Render (Backend)

### Option A — Using render.yaml (recommended)
1. Push repo to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your repo — Render reads `render.yaml` automatically
4. Add secret env vars in the Render dashboard:
   - `JWT_SECRET` — generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `FRONTEND_URL` — your Netlify URL

### Option B — Manual
1. **New** → **Web Service** → connect repo
2. Build command: `cd backend && npm install`
3. Start command: `cd backend && npm start`
4. Add all env vars from `backend/.env.example`

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
JWT_SECRET=your-64-char-random-secret
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://fanvora-api.onrender.com
```

---

## Local Development

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run backend
cd backend && npm run dev   # runs on :5000

# Run frontend (new terminal)
cd frontend && npm run dev  # runs on :3000
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Creator | `creator@demo.com` | `password123` |
| Fan | `fan@demo.com` | `password123` |

> The demo uses an in-memory database. Data resets on server restart. Replace with PostgreSQL for production.

---

## PWA Testing Checklist

- [ ] Open in Chrome → DevTools → **Application** tab → confirm manifest loads
- [ ] Check **Service Workers** section — status should be "activated and running"
- [ ] Go to **Lighthouse** tab → run PWA audit (target: 90+)
- [ ] On Android Chrome: look for "Add to Home Screen" prompt
- [ ] On iOS Safari: Share → "Add to Home Screen"
- [ ] Disconnect network → reload → should show offline banner and serve cached shell
