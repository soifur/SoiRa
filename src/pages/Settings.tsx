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
        <TabsList className="w-full flex flex-wrap md:flex-nowrap gap-2">
          <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
          <TabsTrigger value="memory" className="flex-1">Memory Bot</TabsTrigger>
          <TabsTrigger value="instructions" className="flex-1">Custom Instructions</TabsTrigger>
          <TabsTrigger value="subscription" className="flex-1">Subscription</TabsTrigger>
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