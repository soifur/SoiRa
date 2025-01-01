import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Cookie } from "lucide-react";
import Cookies from "js-cookie";

interface CookieConsentProps {
  onAccept: () => void;
  onReject: () => void;
}

const CookieConsent = ({ onAccept, onReject }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    const hasConsent = Cookies.get("chat_cookie_consent");
    // Only check for explicit acceptance, treat everything else as needing consent
    if (hasConsent !== "accepted") {
      setIsVisible(true);
      setIsRejected(false);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    setIsRejected(false);
    onAccept();
  };

  const handleReject = () => {
    setIsVisible(false);
    setIsRejected(true);
    onReject();
  };

  if (!isVisible && !isRejected) return null;

  if (isRejected) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg p-6 space-y-6 shadow-lg border-2">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-center">Cookies Required</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              You cannot access this Chatbot without accepting cookies. We use cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Save your chat history</li>
              <li>Improve our services and bot responses</li>
              <li>Provide a personalized chat experience</li>
              <li>Analyze usage patterns to enhance our bot</li>
            </ul>
          </div>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => {
                setIsRejected(false);
                setIsVisible(true);
              }}
              className="w-full max-w-xs space-x-2"
            >
              <Cookie className="h-4 w-4" />
              <span>Change Cookie Preferences</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg p-6 space-y-6 shadow-lg border-2">
        <h2 className="text-2xl font-semibold text-center">Cookie Consent Required</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            To access this Chatbot, you must accept the required cookies. We use cookies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Save your chat history</li>
            <li>Improve our services and bot responses</li>
            <li>Provide a personalized chat experience</li>
            <li>Analyze usage patterns to enhance our bot</li>
          </ul>
        </div>
        <div className="flex justify-center space-x-4 pt-4">
          <Button 
            variant="outline" 
            onClick={handleReject}
            className="w-32 space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Reject</span>
          </Button>
          <Button 
            onClick={handleAccept}
            className="w-32 space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Accept</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;