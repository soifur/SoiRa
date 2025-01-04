import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to SoiRa Chat</h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Configure your custom AI chatbots and start conversations with various AI models including OpenAI, Anthropic Claude, Google Gemini, and many more through OpenRouter.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/chat">Start Chatting</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/bots">Configure Bots</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;