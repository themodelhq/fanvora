# Fanvora - Content Subscription Platform Specification

## 1. Project Overview

**Project Name:** Fanvora
**Type:** Full-stack Content Subscription Platform (OnlyFans Clone)
**Core Functionality:** A creator monetization platform allowing users to subscribe to exclusive content creators, purchase pay-per-view content, tip creators, and engage through direct messaging.
**Target Users:** Content creators looking to monetize their audience, fans who want exclusive content from their favorite creators.
**Tech Stack:** React (Vite + TypeScript + Tailwind CSS), Node.js/Express, PostgreSQL, PayStack API
**Deployment:** Netlify (Frontend), Render (Backend)

---

## 2. Visual & UI Specification

### Brand Colors
- **Primary:** Deep Purple `#5A0F4D`
- **Primary Dark:** `#3D0A33`
- **Primary Light:** `#7B2D6B`
- **Accent:** Gold `#D4AF37`
- **Background Dark:** `#1A1A2E`
- **Background Card:** `#16213E`
- **Text Primary:** `#FFFFFF`
- **Text Secondary:** `#B0B0B0`
- **Success:** `#00D26A`
- **Error:** `#FF4757`
- **Warning:** `#FFA502`

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Accent/Numbers:** Space Grotesk

### Design Language
- Dark theme with purple gradients
- Glassmorphism effects on cards
- Subtle animations on hover states
- Card-based layout with rounded corners (16px radius)
- Gradient overlays on featured content

### Layout Structure
1. **Landing Page:** Hero section, featured creators, how it works, CTA
2. **Auth Pages:** Login, Register with role selection (Creator/Fan)
3. **Dashboard:**
   - Creator: Analytics, Content Management, Earnings, Subscribers
   - Fan: Subscriptions, Feed, Purchases, Messages
4. **Creator Profile:** Bio, pricing, content grid, subscriber count
5. **Content View:** Posts, PPV content, media galleries
6. **Messaging:** Real-time chat between users
7. **Settings:** Profile, payment methods, notifications

---

## 3. Core Features Specification

### 3.1 Authentication System
- User registration with email/password
- Role selection: Creator or Fan
- Email verification (simulated)
- JWT-based authentication
- Profile completion flow

### 3.2 Creator Features
- **Profile Management:**
  - Banner image, avatar upload
  - Bio, social links
  - Subscription pricing (monthly)
  - Pay-per-view (PPV) content pricing

- **Content Management:**
  - Create text posts (max 5000 chars)
  - Upload images (multiple)
  - Upload videos (with thumbnail)
  - Set PPV content with price
  - Schedule posts
  - Pin posts
  - Delete/edit posts

- **Subscriber Management:**
  - View subscriber list
  - See subscriber analytics
  - Block subscribers
  - Custom welcome message

- **Earnings Dashboard:**
  - Total earnings
  - Subscriber revenue
  - PPV revenue
  - Tips received
  - Withdrawal history
  - PayStack payout integration

### 3.3 Fan Features
- **Discovery:**
  - Browse featured creators
  - Search by username/name
  - Filter by category
  - View creator previews (1 free post)

- **Subscriptions:**
  - Subscribe to creators (monthly)
  - Manage active subscriptions
  - Auto-renewal option
  - Cancel subscription

- **Content Consumption:**
  - View subscribed content
  - Purchase PPV content
  - Like/bookmark posts
  - Comment on posts

- **Interaction:**
  - Tip creators
  - Send messages
  - Request custom content

### 3.4 Payment System (PayStack)
- **Subscription Payments:**
  - Monthly subscription to creators
  - Recurring billing (simulated)
  - Payment confirmation

- **PPV Payments:**
  - One-time purchase of content
  - Instant access after payment

- **Tips:**
  - Custom amount tips
  - Instant payment

- **Payouts (Creators):**
  - Request withdrawal
  - PayStack transfer to bank

### 3.5 Messaging System
- Real-time chat (simulated with polling)
- Text messages
- Image sharing
- Message read receipts
- Online status indicators

### 3.6 Feed & Discovery
- Chronological feed of subscribed creators
- Trending/featured creators
- New creators section
- Category-based browsing

---

## 4. Database Schema

### Users Table
```
- id (UUID, PK)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- username (VARCHAR, unique)
- display_name (VARCHAR)
- bio (TEXT)
- avatar_url (VARCHAR)
- banner_url (VARCHAR)
- role (ENUM: 'fan', 'creator')
- is_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Creator Profiles Table
```
- id (UUID, PK)
- user_id (UUID, FK)
- subscription_price (DECIMAL)
- category (VARCHAR)
- social_links (JSONB)
- total_subscribers (INTEGER)
- total_earnings (DECIMAL)
- created_at (TIMESTAMP)
```

### Subscriptions Table
```
- id (UUID, PK)
- fan_id (UUID, FK)
- creator_id (UUID, FK)
- status (ENUM: 'active', 'cancelled', 'expired')
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- auto_renew (BOOLEAN)
```

### Posts Table
```
- id (UUID, PK)
- creator_id (UUID, FK)
- content (TEXT)
- media_urls (JSONB)
- media_type (ENUM: 'text', 'image', 'video', 'mixed')
- is_ppv (BOOLEAN)
- ppv_price (DECIMAL)
- is_pinned (BOOLEAN)
- like_count (INTEGER)
- created_at (TIMESTAMP)
```

### Purchases Table
```
- id (UUID, PK)
- user_id (UUID, FK)
- post_id (UUID, FK)
- type (ENUM: 'subscription', 'ppv', 'tip')
- amount (DECIMAL)
- paystack_ref (VARCHAR)
- created_at (TIMESTAMP)
```

### Messages Table
```
- id (UUID, PK)
- sender_id (UUID, FK)
- receiver_id (UUID, FK)
- content (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

### Tips Table
```
- id (UUID, PK)
- from_user_id (UUID, FK)
- to_user_id (UUID, FK)
- amount (DECIMAL)
- message (TEXT)
- paystack_ref (VARCHAR)
- created_at (TIMESTAMP)
```

---

## 5. API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/profile

### Users/Creators
- GET /api/creators (list with filters)
- GET /api/creators/:id
- GET /api/creators/featured
- GET /api/creators/search

### Subscriptions
- POST /api/subscriptions
- GET /api/subscriptions/my
- DELETE /api/subscriptions/:id
- PUT /api/subscriptions/:id/renew

### Posts
- GET /api/posts/feed
- GET /api/posts/creator/:id
- POST /api/posts
- PUT /api/posts/:id
- DELETE /api/posts/:id
- POST /api/posts/:id/like
- POST /api/posts/:id/purchase

### Payments (PayStack)
- POST /api/payments/subscribe
- POST /api/payments/ppv
- POST /api/payments/tip
- POST /api/payments/verify
- POST /api/payments/withdraw

### Messages
- GET /api/messages/conversations
- GET /api/messages/:userId
- POST /api/messages
- PUT /api/messages/:id/read

### Analytics (Creator)
- GET /api/analytics/overview
- GET /api/analytics/subscribers
- GET /api/analytics/revenue

---

## 6. Frontend Pages

1. **Landing Page** (`/`)
2. **Login** (`/login`)
3. **Register** (`/register`)
4. **Creator Profile** (`/creator/:username`)
5. **Dashboard** (`/dashboard`)
   - Overview Tab
   - Content Tab
   - Subscribers Tab (Creator) / Subscriptions Tab (Fan)
   - Earnings Tab (Creator)
   - Messages Tab
   - Settings Tab
6. **Post Detail** (`/post/:id`)
7. **Payment Success** (`/payment/success`)
8. **Payment Cancel** (`/payment/cancel`)

---

## 7. Deployment Configuration

### Frontend (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_API_URL`
  - `VITE_PAYSTACK_PUBLIC_KEY`

### Backend (Render)
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PAYSTACK_SECRET_KEY`
  - `PAYSTACK_PUBLIC_KEY`
  - `FRONTEND_URL`

---

## 8. Acceptance Criteria

1. ✅ Landing page displays with correct purple branding
2. ✅ Users can register as Fan or Creator
3. ✅ Creators can set subscription price
4. ✅ Fans can browse and subscribe to creators
5. ✅ Creators can create posts (text, images)
6. ✅ Subscribers can view creator content
7. ✅ PPV content requires purchase to view
8. ✅ PayStack payment integration works
9. ✅ Messaging between users functions
10. ✅ Dashboard shows relevant statistics
11. ✅ Responsive design on mobile/desktop
12. ✅ Application deploys to Netlify and Render

---

## 9. Non-Functional Requirements

- **Performance:** Fast page loads, lazy loading for images
- **Security:** Password hashing, JWT validation, input sanitization
- **Scalability:** Modular architecture for future features
- **Accessibility:** Keyboard navigation, proper ARIA labels
