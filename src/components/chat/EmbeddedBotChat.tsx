import { useParams } from "react-router-dom";
import EmbeddedChatContainer from "./embedded/EmbeddedChatContainer";

const EmbeddedBotChat = () => {
  const { botId } = useParams();
  
  if (!botId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Bot ID is required</div>
      </div>
    );
  }

  return <EmbeddedChatContainer botId={botId} />;
};

export default EmbeddedBotChat;