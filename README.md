# Meet AI 🤖

Meet AI is an intelligent, AI-powered video conferencing application that lets users create customized AI Agents to join their video calls in real-time. It seamlessly integrates real-time video, autonomous voice agents, automated transcriptions, post-meeting summaries, and a chat interface to talk to your agent *after* the meeting ends.

## 🚀 Key Features

- **Real-time Video Calls:** High-quality, low-latency video and audio rooms.
- **Custom Autonomous AI Agents:** Create customized bots (Sales, Support, HR, etc.) directly from the dashboard.
- **Live Voice Interaction:** The AI Agent joins the call natively as a participant and speaks in real-time using OpenAI's Realtime Voice API.
- **Automated Summaries & Transcripts:** Background jobs automatically process meeting recordings and transcripts to generate concise summaries.
- **"Chat with your Meeting":** A post-meeting text chat interface where users can ask their Agent questions about what happened during the video call.
- **Monetization & Limits:** Role-based access and usage limits enforced via a Premium subscription tier.

---

## 🏗️ System Architecture & Project Flow

The magic of Meet AI happens through a carefully orchestrated event-driven architecture relying on **Webhooks** and **Background Jobs**:

1. **Authentication & Setup:** Users sign in securely using Better Auth. They can navigate the dashboard to create custom AI Agents. 
2. **Joining a Meeting:** When a user creates and joins a meeting room, the frontend connects to **Stream Video**.
3. **Agent Spawning (The Webhook Flow):** 
   - Stream Video detects the room is active and fires a `call.session_started` webhook to the Next.js backend (`/api/webhook`).
   - The backend securely passes the meeting ID and the Agent's system instructions to the `@stream-io/openai-realtime-api`.
   - The AI Agent establishes a WebSocket connection with **OpenAI Realtime** and joins the Stream Call as a regular participant with voice capabilities.
4. **Post-Meeting Processing (Inngest):**
   - When the creator ends the call, Stream generates a recording and transcription, firing the `call.transcription_ready` webhook.
   - The Next.js backend receives this event and triggers an **Inngest** background job.
   - Inngest securely downloads the transcript in the background, feeds it to an LLM, and saves the formatted summary to the database.
5. **Continuous Conversation:** 
   - In the dashboard, users can open the chat for a past meeting. 
   - Powered by **Stream Chat**, whenever a user sends a message, a `message.new` webhook is triggered.
   - The backend intercepts this message, injects the meeting summary as context into a prompt, and responds to the user as the agent.

---

## 💻 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions) & React 19
- **Styling:** Tailwind CSS v4 & [Shadcn/UI](https://ui.shadcn.com/)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **API/Data Fetching:** [tRPC](https://trpc.io/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **Video & Chat:** [Stream Video React SDK](https://getstream.io/video/) & Stream Chat
- **Background Jobs:** [Inngest](https://www.inngest.com/)
- **AI Integration:** [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) (`gpt-4o-realtime-preview`)
- **Billing:** [Polar.sh](https://polar.sh/)

---

## 🛠️ Local Development Setup

### 1. Install Dependencies
```bash
# Use --legacy-peer-deps for React 19 compatibility
npm install --legacy-peer-deps
```

### 2. Environment Variables
Copy the template and fill in your credentials from the respective services.
```bash
cp .env.example .env.local
```
**Required Accounts:**
- **Neon:** PostgreSQL Database URL
- **Stream:** Video & Chat API Keys
- **OpenAI:** Paid Tier 1+ account required for the Realtime Voice model
- **Polar:** API Token for premium account limits
- **Better Auth:** Authentication secret

### 3. Database Setup
```bash
# Push schema securely to your Neon database
npm run db:push
```

### 4. Running the App (Webhooks Required)

Because the AI Agent completely relies on receiving webhooks from Stream Video, your local server **must** be exposed to the internet via Ngrok.

**Start the Next.js Server:**
```bash
npm run dev
```

**Expose the server via Ngrok (In a new terminal):**
```bash
npx ngrok http 3000
```
*Note: Copy the absolute public URL Ngrok generates (e.g., `https://xyz.ngrok-free.app`) and paste it into the **Webhooks** section of your Stream Video dashboard with the path `/api/webhook` appended (e.g., `https://xyz.ngrok-free.app/api/webhook`).*

**Start Inngest Background Jobs (Optional for summaries):**
```bash
npx inngest-cli@latest dev
```
