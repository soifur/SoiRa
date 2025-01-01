import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Cookies from "js-cookie";

interface CookieConsentProps {
  onAccept: () => void;
  onReject: () => void;
}

const CookieConsent = ({ onAccept, onReject }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = Cookies.get("chat_cookie_consent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("chat_cookie_consent", "accepted", { expires: 365 });
    setIsVisible(false);
    onAccept();
  };

  const handleReject = () => {
    Cookies.set("chat_cookie_consent", "rejected", { expires: 365 });
    setIsVisible(false);
    onReject();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Cookie Consent Required</h2>
        <p className="text-muted-foreground">
          To access this Chatbot, you must accept the required cookies. We use cookies to improve our services
          and provide you with a better chat experience by saving your chat history.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;