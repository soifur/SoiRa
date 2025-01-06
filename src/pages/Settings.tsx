import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSubscriptionSettings } from "@/components/settings/ModelSubscriptionSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { MemoryBotSettings } from "@/components/settings/MemoryBotSettings";
import { CustomInstructions } from "@/components/settings/CustomInstructions";
import { SubscriptionSettings } from "@/components/settings/subscription/SubscriptionSettings";
import { Settings as SettingsIcon, User, MessageSquare, Database, CreditCard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const isMobile = useIsMobile();

  const tabs = [
    {
      value: "general",
      label: "General",
      icon: SettingsIcon,
      content: <ProfileSettings />
    },
    {
      value: "memory",
      label: "Memory Bot",
      icon: Database,
      content: <MemoryBotSettings />
    },
    {
      value: "instructions",
      label: "Custom Instructions",
      icon: MessageSquare,
      content: <CustomInstructions />
    },
    {
      value: "subscription",
      label: "Subscription",
      icon: CreditCard,
      content: <SubscriptionSettings />
    },
    {
      value: "model_subscription",
      label: "Model Subscription",
      icon: CreditCard,
      content: <ModelSubscriptionSettings />
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar / Top Navigation */}
        <div className={cn(
          "border-b md:border-r bg-muted/50",
          isMobile ? "w-full" : "w-64"
        )}>
          <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <h1 className="text-xl font-semibold">Settings</h1>
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className={cn(
            "flex",
            isMobile ? "overflow-x-auto" : "flex-col h-full"
          )}>
            <nav className={cn(
              isMobile ? "flex p-2 min-w-full" : "flex-1 p-2 space-y-1"
            )}>
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 font-medium rounded-md transition-colors",
                    isMobile 
                      ? "px-4 py-2 text-xs whitespace-nowrap flex-shrink-0" 
                      : "w-full px-4 py-2 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeTab === tab.value 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {tabs.find(tab => tab.value === activeTab)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;