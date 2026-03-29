import { StreamClient } from '@stream-io/node-sdk';
import 'dotenv/config';

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
  const secret = process.env.STREAM_VIDEO_SECRET_KEY;
  if (!apiKey || !secret) throw new Error("Missing keys");

  const client = new StreamClient(apiKey, secret);
  // Just seeing what properties exist
  console.log("Client properties:", Object.keys(client));
}
main().catch(console.error);
