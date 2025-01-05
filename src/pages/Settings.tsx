import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSubscriptionSettings } from "@/components/settings/ModelSubscriptionSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { MemoryBotSettings } from "@/components/settings/MemoryBotSettings";
import { CustomInstructions } from "@/components/settings/CustomInstructions";

const Settings = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="memory">Memory Bot</TabsTrigger>
          <TabsTrigger value="instructions">Custom Instructions</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
  );
};

export default Settings;