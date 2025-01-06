import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot } from "@/hooks/useBots";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMemoryBotSettings } from "@/hooks/useMemoryBotSettings";

interface EmbedOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Bot | null;
}

export const EmbedOptionsDialog = ({ isOpen, onClose, bot }: EmbedOptionsDialogProps) => {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const [shareKey, setShareKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { settings: memorySettings } = useMemoryBotSettings();
  
  useEffect(() => {
    const createShareConfig = async () => {
      if (!bot || !isOpen) return;
      
      setIsLoading(true);
      try {
        // First, get the latest bot data to ensure we have the current memory_enabled value
        const { data: currentBot, error: botError } = await supabase
          .from('bots')
          .select('memory_enabled')
          .eq('id', bot.id)
          .single();

        if (botError) throw botError;

        const memory_enabled = currentBot?.memory_enabled === true;
        
        // Get quiz configuration status
        const { data: quizConfig } = await supabase
          .from('quiz_configurations')
          .select('enabled, id')
          .eq('bot_id', bot.id)
          .single();

        const quiz_mode = quizConfig?.enabled === true;
        
        // First check if a share configuration already exists
        const { data: existingShare } = await supabase
          .from('shared_bots')
          .select('short_key')
          .eq('bot_id', bot.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingShare) {
          // Update the existing share configuration with latest bot data
          const { error: updateError } = await supabase
            .from('shared_bots')
            .update({
              bot_name: bot.name,
              instructions: bot.instructions,
              starters: bot.starters,
              model: bot.model,
              open_router_model: bot.openRouterModel,
              memory_enabled: memory_enabled,
              memory_instructions: memorySettings?.instructions,
              memory_model: memorySettings?.model,
              memory_api_key: memorySettings?.api_key,
              quiz_mode: quiz_mode
            })
            .eq('short_key', existingShare.short_key);

          if (updateError) throw updateError;
          setShareKey(existingShare.short_key);
          return;
        }

        // If no existing share found, create new configuration
        
        // First store the API key
        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('bot_api_keys')
          .insert({
            bot_id: bot.id,
            api_key: bot.apiKey,
          })
          .select()
          .single();

        if (apiKeyError) throw apiKeyError;

        // Generate a short share key
        const { data: shortKeyData } = await supabase
          .rpc('generate_short_key');
        
        const newShareKey = shortKeyData;
        
        // Create new share configuration
        const { error: shareError } = await supabase
          .from('shared_bots')
          .insert({
            share_key: bot.id,
            short_key: newShareKey,
            bot_id: bot.id,
            bot_name: bot.name,
            instructions: bot.instructions,
            starters: bot.starters,
            model: bot.model,
            open_router_model: bot.openRouterModel,
            api_key_id: apiKeyData.id,
            memory_enabled: memory_enabled,
            memory_instructions: memorySettings?.instructions,
            memory_model: memorySettings?.model,
            memory_api_key: memorySettings?.api_key,
            quiz_mode: quiz_mode
          });

        if (shareError) throw shareError;

        setShareKey(newShareKey);
      } catch (error) {
        console.error("Error storing share configuration:", error);
        toast({
          title: "Error",
          description: "Failed to create share configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createShareConfig();
  }, [bot, isOpen, toast, memorySettings]);

  if (!bot) {
    return null;
  }

  const publicLink = `${baseUrl}/embed/${shareKey}`;
  const embedCode = `<iframe src="${publicLink}" width="100%" height="600px" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard`,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share or Embed Chat
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="text-center">Creating share link...</div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Public Link</h3>
                <div className="flex gap-2">
                  <Input value={publicLink} readOnly />
                  <Button onClick={() => copyToClipboard(publicLink, "Public link")}>
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Embed Code</h3>
                <div className="flex gap-2">
                  <Input value={embedCode} readOnly />
                  <Button onClick={() => copyToClipboard(embedCode, "Embed code")}>
                    Copy
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};