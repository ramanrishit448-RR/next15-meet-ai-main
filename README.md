# Meet AI 🤖

**Meet AI** is an intelligent, AI-powered video conferencing platform that enables users to build custom autonomous AI Agents that join video calls in real-time. Powered by Next.js 15, Stream Video, OpenAI Realtime, Neon Serverless Postgres, and Razorpay Subscriptions.

---

## 🌟 Key Features & Highlights

- 🎥 **Real-Time Video Calls:** Low-latency video and audio meeting rooms powered by Stream Video SDK.
- 🤖 **Custom AI Agents:** Create customized AI bots (Sales, Support, HR, Interviewer) with specific instructions and personalities.
- 🎙️ **Live Voice Interaction:** AI Agents join the meeting natively as call participants and speak in real-time using OpenAI's Realtime Voice API (`gpt-4o-realtime-preview`).
- 📝 **Automated Transcripts & Summaries:** Background processing jobs via **Inngest** automatically capture meeting transcripts, run LLM analysis, and generate structured summaries.
- 💬 **"Chat with Your Meeting":** Post-meeting interactive chat powered by Stream Chat. Ask your Agent questions about key decisions, action items, or transcript details after the call ends.
- 💳 **Razorpay Subscriptions (INR Billed):** Tiered subscription page built specifically for Indian market compatibility with **Free**, **Pro**, and **Ultimate** plans.
- 🔒 **Tier Limits Enforcement:** tRPC middleware enforcing monthly meeting and agent limits per active subscription plan.
- 🎨 **Modern Dark UI/UX:** Responsive design using Tailwind CSS, Shadcn UI, glassmorphism, dynamic progress bars, and custom pricing badges.

---

## 💳 Subscription Tiers & Pricing Model

Meet AI includes a 3-tier subscription model powered natively by **Razorpay**:

| Feature / Limit | Free Plan (₹0/mo) | Pro Plan (₹499/mo) | Ultimate Plan (₹999/mo) |
| :--- | :---: | :---: | :---: |
| **Monthly Meetings** | 3 meetings | **Unlimited** | **Unlimited** |
| **AI Agents** | 1 agent | **5 agents** | **Unlimited** |
| **AI Summaries** | Basic | Advanced | Advanced |
| **Real-time Transcription** | Standard | Real-time | Real-time |
| **Support** | Email | Priority | Dedicated Account Manager |
| **Badge / Highlight** | Current Plan | **Most Popular** (Dark Green) | **Best Value** (Deep Purple) |

---

## 🏗️ Technical Architecture & Workflow

```
User signs in  ──►  Create / Manage AI Agents  ──►  Launch Video Room (Stream Video)
                                                                 │
                                                       Session Started Webhook
                                                                 │
                                                                 ▼
                                                  OpenAI Realtime Voice Agent Joins Call
                                                                 │
                                                       Call Ended Webhook
                                                                 │
                                                                 ▼
                                                Inngest Async Job: Summarize & Store Transcript
                                                                 │
                                                                 ▼
                                                  Post-Meeting Chat (Stream Chat)
```

1. **Authentication:** Better Auth handles session management using a stateless Neon Serverless Postgres HTTP connection (preventing `ECONNRESET` drops).
2. **Agent Webhook Trigger:** When a meeting starts, Stream Video fires a `call.session_started` webhook to `/api/webhook`. The backend spawns an OpenAI Realtime Voice WebSocket instance that joins the call as a participant.
3. **Post-Call Processing:** When the call ends, Stream sends a transcript ready webhook, triggering an **Inngest** background worker to analyze the text and save summaries to the Neon Postgres database.
4. **Razorpay Payments & Verification:**
   - Client calls `/api/razorpay/create-order` to generate a Razorpay order server-side.
   - Client opens the native Razorpay Checkout SDK modal.
   - Upon payment, `/api/razorpay/verify-payment` verifies the HMAC-SHA256 signature server-side and upserts the active plan into the `subscriptions` Postgres table.
   - UI automatically invalidates tRPC cache, instantly updating user limits and sidebar stats.

---

## 💻 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Styling:** Tailwind CSS & [Shadcn UI](https://ui.shadcn.com/)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **API Layer:** [tRPC](https://trpc.io/) & React Query
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Video & Chat:** [Stream Video SDK](https://getstream.io/video/) & Stream Chat
- **AI Engine:** [OpenAI Realtime Voice API](https://platform.openai.com/docs/guides/realtime) (`gpt-4o-realtime-preview`)
- **Payments:** [Razorpay Node SDK](https://razorpay.com/)
- **Background Jobs:** [Inngest](https://www.inngest.com/)

---

## 🔑 Environment Variables Setup (`.env`)

When cloning this project, create a `.env` file in the root directory with the following variables:

```env
## Core Database & Authentication
DATABASE_URL="postgresql://user:password@ep-ep-name.us-east-1.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="your_better_auth_secret_key"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_API_KEY="your_better_auth_api_key"

## Stream API Credentials (Video & Chat)
NEXT_PUBLIC_STREAM_VIDEO_API_KEY="your_stream_video_api_key"
STREAM_VIDEO_SECRET_KEY="your_stream_video_secret_key"
NEXT_PUBLIC_STREAM_CHAT_API_KEY="your_stream_chat_api_key"
STREAM_CHAT_SECRET_KEY="your_stream_chat_secret_key"

## OpenAI Credentials (Required for AI Voice & Summaries)
OPENAI_API_KEY="sk-proj-your_openai_api_key"

## Razorpay Integration (Required for Subscriptions)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

## Application & Background Jobs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
INNGEST_EVENT_KEY="sk-inn-your_inngest_event_key"
INNGEST_BASE_URL="https://api.inngest.com"
```

---

## 🛠️ Local Installation & Setup

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/your-username/next15-meet-ai.git
cd next15-meet-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` (or create `.env`) and add your API keys as documented in the section above.

### 3. Push Database Schema
Push the Drizzle ORM schema (including tables for users, sessions, agents, meetings, and subscriptions) to your Neon database:
```bash
npm run db:push
```

### 4. Run Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Setup Webhook Tunneling (For AI Agent Voice & Webhooks)
Because Stream Video sends webhooks when calls start, your local server must be accessible publicly:
```bash
npx ngrok http 3000
```
Copy the Ngrok HTTPS forwarding URL (e.g., `https://xyz.ngrok-free.app`) and configure it in your Stream Video Dashboard under **Webhooks** with `/api/webhook` appended (`https://xyz.ngrok-free.app/api/webhook`).

### 6. Run Inngest Background Worker (Optional for Summaries)
```bash
npx inngest-cli@latest dev
```

---

## 🚀 Deploying to Vercel

When deploying to Vercel:

1. Import the repository in your Vercel Dashboard.
2. Under **Project Settings ➔ Environment Variables**, add **ALL** environment variables listed in the `.env` section above (especially `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`).
3. Deploy!

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
