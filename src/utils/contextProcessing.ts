import { Message } from "@/components/chat/types/chatTypes";

interface ExtractedContext {
  name?: string;
  faith?: string;
  likes: string[];
  topics: string[];
  facts: string[];
}

export const extractContextFromMessages = (messages: Message[]): ExtractedContext => {
  const context: ExtractedContext = {
    likes: [],
    topics: [],
    facts: []
  };

  messages.forEach(message => {
    if (message.role === 'user') {
      // Extract name if mentioned
      const nameMatch = message.content.match(/my name is ([^\.,!?]+)/i);
      if (nameMatch) {
        context.name = nameMatch[1].trim();
      }

      // Extract faith if mentioned
      const faithMatch = message.content.match(/I am (a |an )?([^\.,!?]+) (believer|faith|religion)/i);
      if (faithMatch) {
        context.faith = faithMatch[2].trim();
      }

      // Extract likes
      const likeMatches = message.content.match(/I (like|love|enjoy|prefer) ([^\.,!?]+)/gi);
      if (likeMatches) {
        likeMatches.forEach(match => {
          const like = match.replace(/I (like|love|enjoy|prefer) /i, '').trim();
          if (!context.likes.includes(like)) {
            context.likes.push(like);
          }
        });
      }

      // Extract topics
      const topicMatches = message.content.match(/\b(about|regarding|concerning) ([^\.,!?]+)/gi);
      if (topicMatches) {
        topicMatches.forEach(match => {
          const topic = match.replace(/\b(about|regarding|concerning) /i, '').trim();
          if (!context.topics.includes(topic)) {
            context.topics.push(topic);
          }
        });
      }

      // Extract facts
      const factMatches = message.content.match(/I (am|work as|live in|have) ([^\.,!?]+)/gi);
      if (factMatches) {
        factMatches.forEach(match => {
          const fact = match.trim();
          if (!context.facts.includes(fact)) {
            context.facts.push(fact);
          }
        });
      }
    }
  });

  return context;
};

export const mergeContexts = (oldContext: any, newContext: any) => {
  return {
    name: newContext.name || oldContext.name,
    faith: newContext.faith || oldContext.faith,
    likes: [...new Set([...(oldContext.likes || []), ...(newContext.likes || [])])],
    topics: [...new Set([...(oldContext.topics || []), ...(newContext.topics || [])])],
    facts: [...new Set([...(oldContext.facts || []), ...(newContext.facts || [])])]
  };
};