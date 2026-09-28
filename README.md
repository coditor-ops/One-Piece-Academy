# One Piece Academy — Sabaody Skill Exchange

A One Piece themed peer-to-peer skill marketplace with dynamic, demand-based pricing. Learners trade skills using an in-app currency, **Vivre Card Tokens (VCT)**. The price of a skill rises when many people want it and few teach it, and falls when the opposite is true.

## Features

- **Full-Stack Application:** Fully migrated from a single-file prototype to a robust architecture using React, Tailwind CSS, Express, Prisma, and MongoDB.
- **Glassmorphism & High-End UI:** Beautiful frosted-glass UI components, smooth page transitions via Framer Motion, responsive full-screen layouts, and bespoke pirate-themed typography.
- **Demand-Based Pricing:** The economy is alive. Prices adjust dynamically based on a supply-and-demand algorithm. 
- **Pirate Rush Simulator:** Click the "Simulate Pirate Rush" button to artificially inject demand into the market and watch a specific skill's price surge in real-time.
- **Secure Authentication:** Complete JWT-based authentication system with secure password hashing.
- **Escrow Booking System:** When you book a session, your Vivre Card Tokens are locked in escrow ("Held by Marine HQ") until the session is completed or canceled.
- **Dashboards:** Dedicated "Fleet Admin" and personal dashboards for managing active sessions and incoming requests.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Query, React Router v6
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** MongoDB
- **Fonts:** Custom fonts (`Masky`, `Retro Gramophone`, `Veloria`)

## Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/coditor-ops/One-Piece-Academy.git
   cd One-Piece-Academy
   ```

2. **Install dependencies:**
   The root `package.json` will automatically install client and server dependencies.
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the `server/` directory:
   ```env
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.../grandline?retryWrites=true&w=majority"
   JWT_SECRET="your-super-secret-key"
   CLIENT_ORIGIN="http://localhost:5173"
   PORT=3001
   ```
   *(Note: Ensure your MongoDB connection string includes the database name, e.g., `/grandline`)*

4. **Initialize Database:**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   cd ..
   ```

5. **Start the Development Server:**
   From the project root:
   ```bash
   npm run dev
   ```
   This utilizes `concurrently` to launch both the Vite frontend (`http://localhost:5173`) and the Express backend (`http://localhost:3001`) simultaneously.

## Deployment

This project is configured to deploy seamlessly on platforms like **Render** as a unified Web Service.

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Required Environment Variables:**
  - `NODE_ENV=production`
  - `DATABASE_URL` (Make sure the database name is explicitly included before the `?`)
  - `JWT_SECRET`
  - `CLIENT_ORIGIN` (Your production frontend URL)

*The root `package.json` utilizes a `postinstall` script with `--include=dev` to ensure tools like Vite are properly installed during production builds.*

## Art and Licensing

All page art, styling, and structural elements are original. The design relies entirely on CSS, gradients, glassmorphism, and custom fonts to evoke the pirate theme. No official artwork, logos, or manga panels are included to maintain copyright compliance.

---
*Prepared for PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing (One Piece theme).*
