import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSubscriptionSettings } from "@/components/settings/ModelSubscriptionSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { MemoryBotSettings } from "@/components/settings/MemoryBotSettings";
import { CustomInstructions } from "@/components/settings/CustomInstructions";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <h1 className="text-xl font-semibold">Settings</h1>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full flex flex-wrap md:flex-nowrap gap-2 mb-6">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex-1">
                Memory Bot
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex-1">
                Custom Instructions
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1">
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="memory" className="mt-6">
              <MemoryBotSettings />
            </TabsContent>

            <TabsContent value="instructions" className="mt-6">
              <CustomInstructions />
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <ModelSubscriptionSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;