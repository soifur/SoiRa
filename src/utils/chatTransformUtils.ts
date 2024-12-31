import { ChatRecord, GroupedChatRecord } from "@/components/archive/types";
import { createMessage } from "@/utils/messageUtils";
import { isDatabaseMessage } from "@/types/database";

export const transformChatHistory = (data: any[]): ChatRecord[] => {
  return data.map((record): ChatRecord => {
    console.log("Processing record:", record);
    
    // Messages are already parsed from Supabase
    const messages = record.messages
      .filter((msg: any) => {
        const isValid = isDatabaseMessage(msg);
        if (!isValid) {
          console.warn("Invalid message format:", msg);
        }
        return isValid;
      })
      .map((msg: any) => ({
        id: msg.id || createMessage(msg.role, msg.content).id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        isBot: msg.role === 'assistant'
      }));

    console.log("Transformed messages:", messages);

    return {
      id: record.id,
      botId: record.bot_id,
      messages,
      timestamp: record.created_at || new Date().toISOString(),
      shareKey: record.share_key,
      type: record.share_key ? 'public' : 'private',
      user_id: record.user_id,
      client_id: record.client_id || 'unknown'
    };
  });
};

export const groupChatsByClient = (transformedHistory: ChatRecord[]): GroupedChatRecord[] => {
  const groupedChats = transformedHistory.reduce((acc: GroupedChatRecord[], chat) => {
    const existingGroup = acc.find(
      group => group.clientId === chat.client_id
    );

    if (existingGroup) {
      existingGroup.chats.push(chat);
      if (chat.timestamp > existingGroup.latestTimestamp) {
        existingGroup.latestTimestamp = chat.timestamp;
      }
    } else {
      acc.push({
        clientId: chat.client_id || 'unknown',
        botId: chat.botId,
        chats: [chat],
        latestTimestamp: chat.timestamp
      });
    }
    return acc;
  }, []);

  // Sort groups by latest timestamp
  groupedChats.sort((a, b) => 
    new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
  );

  // Sort chats within each group by timestamp
  groupedChats.forEach(group => {
    group.chats.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  return groupedChats;
};