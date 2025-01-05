import { ModelSubscriptionSettings } from "@/components/settings/ModelSubscriptionSettings";

const Settings = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-8">
        <ModelSubscriptionSettings />
      </div>
    </div>
  );
};

export default Settings;
