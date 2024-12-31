import { Json } from "@/integrations/supabase/types";

export interface DatabaseMessage {
  id?: string;
  role: string;
  content: string;
  timestamp?: string;
  [key: string]: Json | undefined; // Add index signature for Json compatibility
}

export function isDatabaseMessage(json: Json): json is DatabaseMessage {
  if (typeof json !== 'object' || json === null) return false;
  
  const msg = json as Record<string, unknown>;
  return (
    typeof msg.role === 'string' &&
    typeof msg.content === 'string' &&
    (msg.id === undefined || typeof msg.id === 'string') &&
    (msg.timestamp === undefined || typeof msg.timestamp === 'string')
  );
}