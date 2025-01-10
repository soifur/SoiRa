interface SmartResponse {
  response: string;
  context?: {
    tone?: string;
    topics?: string[];
  };
}

export const parseSmartResponse = (response: string): SmartResponse => {
  try {
    const parsed = JSON.parse(response);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        response: parsed.response || response,
        context: parsed.context || {}
      };
    }
  } catch (e) {
    console.log('Not a valid JSON response, using raw text');
  }
  return { response };
};

export const processContextFromResponse = (smartResponse: SmartResponse) => {
  const context: Record<string, any> = {};
  
  if (smartResponse.context?.topics) {
    context.topics = smartResponse.context.topics;
  }
  
  return context;
};