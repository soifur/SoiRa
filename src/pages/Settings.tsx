import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSubscriptionSettings } from "@/components/settings/ModelSubscriptionSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { MemoryBotSettings } from "@/components/settings/MemoryBotSettings";
import { CustomInstructions } from "@/components/settings/CustomInstructions";
import { Settings as SettingsIcon, User, MessageSquare, Database, CreditCard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Settings = () => {
  const navigate = useNavigate();

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
      content: <ModelSubscriptionSettings />
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/50">
          <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <h1 className="text-xl font-semibold">Settings</h1>
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Tabs defaultValue="general" orientation="vertical" className="h-full">
            <TabsList className="flex flex-col items-stretch h-full space-y-1 bg-transparent p-2">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "justify-start gap-2 px-4 py-2 text-left",
                    "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="general" className="w-full">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0"
              >
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;