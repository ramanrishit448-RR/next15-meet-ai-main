import { StreamClient } from '@stream-io/node-sdk';
import fs from 'fs';
import path from 'path';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');

let apiKey = '';
let secret = '';

for (const line of envFile.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_STREAM_VIDEO_API_KEY=')) {
    apiKey = line.split('=')[1].replace(/"/g, '').trim();
  }
  if (line.startsWith('STREAM_VIDEO_SECRET_KEY=')) {
    secret = line.substring(line.indexOf('=') + 1).replace(/"/g, '').trim();
  }
}

async function main() {
  if (!apiKey || !secret) {
    console.error("Missing Stream Video credentials in .env");
    process.exit(1);
  }

  const client = new StreamClient(apiKey, secret);
  
  // Try to update app settings
  try {
    // Check if the method exists
    if ('updateAppSettings' in client) {
      console.log('Method exists!');
    } else {
      console.log('Method not found on top-level client.');
    }
  } catch(e) {
    console.error(e);
  }
}
main();
