import "server-only";

import { StreamClient } from "@stream-io/node-sdk";

let _streamVideo: StreamClient | null = null;
function getStreamVideo(): StreamClient {
  if (_streamVideo) return _streamVideo;

  const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
  const secret = process.env.STREAM_VIDEO_SECRET_KEY;
  if (!apiKey || !secret) {
    throw new Error(
      "Stream Video env vars are missing. Set NEXT_PUBLIC_STREAM_VIDEO_API_KEY and STREAM_VIDEO_SECRET_KEY."
    );
  }

  _streamVideo = new StreamClient(apiKey, secret);
  return _streamVideo;
}

// Lazily initialize so builds don't crash on import
export const streamVideo: StreamClient = new Proxy({} as StreamClient, {
  get(_target, prop) {
    return Reflect.get(getStreamVideo() as unknown as object, prop);
  },
}) as StreamClient;
