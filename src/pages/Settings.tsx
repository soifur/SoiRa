import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/bot/ModelSelector";
import { useMemorySettings } from "@/hooks/useMemorySettings";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { MemorySettings } from "@/hooks/useMemorySettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/components/AvatarUploader";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading, saveSettings } = useMemorySettings();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<MemorySettings>({
    model: "openrouter",
    api_key: "",
    instructions: "",
  });
  const [userProfile, setUserProfile] = useState<Partial<Profile>>({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        model: settings.model,
        open_router_model: settings.open_router_model,
        api_key: settings.api_key || "",
        instructions: settings.instructions || "",
      });
    }
  }, [settings]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar, language')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(profile || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile settings",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveMemorySettings = async () => {
    await saveSettings(formData);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      api_key: e.target.value,
    }));
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      instructions: e.target.value,
    }));
  };

  const handleLanguageChange = async (value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ language: value })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => ({ ...prev, language: value }));
      toast({
        title: "Success",
        description: "Language preference updated",
      });
    } catch (error) {
      console.error('Error updating language:', error);
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => ({ ...prev, avatar: avatarUrl }));
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_history')
        .update({ deleted: 'yes' })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All chats have been deleted",
      });
    } catch (error) {
      console.error('Error deleting chats:', error);
      toast({
        title: "Error",
        description: "Failed to delete chats",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="personalization">Personalization</TabsTrigger>
            <TabsTrigger value="memory">Memory Configuration</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
              {isProfileLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar</label>
                    <AvatarUploader
                      avatar={userProfile.avatar}
                      onAvatarChange={handleAvatarChange}
                    />
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete All Chats
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your chat history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllChats}>
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Personalization Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Select value={userProfile.language || 'en'} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Memory Bot Configuration</h2>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <ModelSelector 
                    bot={{
                      id: "memory-settings",
                      name: "Memory Settings",
                      instructions: "",
                      starters: [],
                      model: formData.model,
                      apiKey: "",
                      openRouterModel: formData.open_router_model,
                    }}
                    onModelChange={(model) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        model: model === "gemini" ? "gemini" : "openrouter" 
                      }))
                    }
                    onOpenRouterModelChange={(model) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        open_router_model: model 
                      }))
                    }
                    isMemorySelector
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">API Key</label>
                    <Input
                      type="password"
                      value={formData.api_key}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your API key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Memory Instructions</label>
                    <Textarea
                      value={formData.instructions}
                      onChange={handleInstructionsChange}
                      placeholder="Enter memory instructions..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSaveMemorySettings}>
                    Save Memory Settings
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Subscription</h2>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Subscription features coming soon!
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;