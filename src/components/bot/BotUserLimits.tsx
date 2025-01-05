import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BotUserLimit {
  id?: string;
  bot_id: string;
  user_role: UserRole;
  token_limit: number | null;
  message_limit: number | null;
}

interface BotUserLimitsProps {
  botId: string;
}

const USER_ROLES: UserRole[] = ['super_admin', 'admin', 'paid_user', 'user'];

export const BotUserLimits = ({ botId }: BotUserLimitsProps) => {
  const [limits, setLimits] = useState<BotUserLimit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLimits();
  }, [botId]);

  const fetchLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_user_limits')
        .select('*')
        .eq('bot_id', botId);

      if (error) throw error;

      // Initialize limits for all roles
      const initialLimits = USER_ROLES.map(role => {
        const existingLimit = data?.find(l => l.user_role === role);
        return existingLimit || {
          bot_id: botId,
          user_role: role,
          token_limit: null,
          message_limit: null
        };
      });

      setLimits(initialLimits);
    } catch (error) {
      console.error('Error fetching limits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user limits",
        variant: "destructive",
      });
    }
  };

  const handleLimitChange = async (
    role: UserRole,
    field: 'token_limit' | 'message_limit',
    value: string
  ) => {
    try {
      const numValue = value ? parseInt(value) : null;
      const updatedLimits = limits.map(limit =>
        limit.user_role === role ? { ...limit, [field]: numValue } : limit
      );
      setLimits(updatedLimits);

      const limitToUpdate = updatedLimits.find(l => l.user_role === role);
      if (!limitToUpdate) return;

      const { error } = await supabase
        .from('bot_user_limits')
        .upsert({
          bot_id: botId,
          user_role: role,
          token_limit: limitToUpdate.token_limit,
          message_limit: limitToUpdate.message_limit
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Limits updated successfully",
      });
    } catch (error) {
      console.error('Error updating limits:', error);
      toast({
        title: "Error",
        description: "Failed to update limits",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">User Role Limits</h3>
      <div className="grid gap-6">
        {limits.map(({ user_role, token_limit, message_limit }) => (
          <div key={user_role} className="space-y-2">
            <Label className="capitalize">{user_role.replace('_', ' ')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token Limit</Label>
                <Input
                  type="number"
                  value={token_limit || ''}
                  onChange={(e) => handleLimitChange(user_role, 'token_limit', e.target.value)}
                  placeholder="Enter token limit"
                  className="dark:bg-[#1e1e1e] dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Message Limit</Label>
                <Input
                  type="number"
                  value={message_limit || ''}
                  onChange={(e) => handleLimitChange(user_role, 'message_limit', e.target.value)}
                  placeholder="Enter message limit"
                  className="dark:bg-[#1e1e1e] dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};