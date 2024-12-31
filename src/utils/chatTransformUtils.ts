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
        timestamp: msg.timestamp || new Date().toISOString(),
        isBot: msg.role === 'assistant'
      }));

    console.log("Transformed messages:", messages);

    // Normalize client_id to prevent splitting of chat history
    const normalizedClientId = record.client_id === 'anonymous' || !record.client_id 
      ? 'anonymous'
      : record.client_id;

    return {
      id: record.id,
      botId: record.bot_id,
      messages,
      timestamp: record.created_at || new Date().toISOString(),
      shareKey: record.share_key,
      type: record.share_key ? 'public' : 'private',
      user_id: record.user_id,
      client_id: normalizedClientId
    };
  });
};

export const groupChatsByClient = (transformedHistory: ChatRecord[]): GroupedChatRecord[] => {
  const groupedChats = transformedHistory.reduce((acc: GroupedChatRecord[], chat) => {
    const existingGroup = acc.find(
      group => group.clientId === chat.client_id
    );

    const latestMessageTime = chat.messages.length > 0 
      ? chat.messages[chat.messages.length - 1].timestamp 
      : chat.timestamp;

    if (existingGroup) {
      existingGroup.chats.push(chat);
      
      if (new Date(latestMessageTime) > new Date(existingGroup.latestTimestamp)) {
        existingGroup.latestTimestamp = latestMessageTime;
      }
    } else {
      acc.push({
        clientId: chat.client_id || 'anonymous',
        botId: chat.botId,
        chats: [chat],
        latestTimestamp: latestMessageTime
      });
    }
    return acc;
  }, []);

  // Sort groups by latest message timestamp
  groupedChats.sort((a, b) => 
    new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
  );

  // Sort chats within each group by latest message timestamp
  groupedChats.forEach(group => {
    group.chats.sort((a, b) => {
      const aLastMessage = a.messages[a.messages.length - 1];
      const bLastMessage = b.messages[b.messages.length - 1];
      const aTime = aLastMessage?.timestamp || a.timestamp;
      const bTime = bLastMessage?.timestamp || b.timestamp;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  });

  return groupedChats;
};