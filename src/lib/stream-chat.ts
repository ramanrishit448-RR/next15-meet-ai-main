import "server-only";

import { StreamChat } from "stream-chat";

let _streamChat: StreamChat | null = null;
function getStreamChat(): StreamChat {
  if (_streamChat) return _streamChat;

  const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;
  const secret = process.env.STREAM_CHAT_SECRET_KEY;
  if (!apiKey || !secret) {
    throw new Error(
      "Stream Chat env vars are missing. Set NEXT_PUBLIC_STREAM_CHAT_API_KEY and STREAM_CHAT_SECRET_KEY."
    );
  }

  _streamChat = StreamChat.getInstance(apiKey, secret);
  return _streamChat;
}

// Lazily initialize so builds don't crash on import
export const streamChat: StreamChat = new Proxy({} as StreamChat, {
  get(_target, prop) {
    return Reflect.get(getStreamChat() as unknown as object, prop);
  },
}) as StreamChat;
