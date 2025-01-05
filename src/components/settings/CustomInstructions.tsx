import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const CustomInstructions = () => {
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('custom_instructions')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.custom_instructions) {
        setInstructions(data.custom_instructions);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ custom_instructions: instructions })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom instructions updated successfully",
      });
    } catch (error) {
      console.error('Error updating instructions:', error);
      toast({
        title: "Error",
        description: "Failed to update custom instructions",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label htmlFor="instructions">Custom Instructions</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter your custom instructions"
            className="min-h-[200px]"
          />
        </div>

        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </div>
    </Card>
  );
};