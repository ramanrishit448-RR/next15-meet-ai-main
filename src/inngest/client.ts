import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "meet-ai-2",
  eventKey: process.env.INNGEST_EVENT_KEY,
  baseUrl: process.env.INNGEST_BASE_URL,
});
