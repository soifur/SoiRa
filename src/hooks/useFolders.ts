import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Folder {
  id: string;
  title: string;
  description: string | null;
  back_half: string | null;
  allow_signups: boolean;
  created_at: string;
  updated_at: string;
}

export interface FolderBot {
  id: string;
  folder_id: string;
  bot_id: string;
  created_at: string;
}

export const useFolders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckingBackHalf, setIsCheckingBackHalf] = useState(false);

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Folder[];
    }
  });

  const createFolder = useMutation({
    mutationFn: async (folder: Partial<Folder>) => {
      const { data, error } = await supabase
        .from('folders')
        .insert(folder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
      console.error("Error creating folder:", error);
    }
  });

  const addBotToFolder = useMutation({
    mutationFn: async ({ folderId, botId }: { folderId: string, botId: string }) => {
      const { data, error } = await supabase
        .from('folder_bots')
        .insert({
          folder_id: folderId,
          bot_id: botId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-bots'] });
      toast({
        title: "Success",
        description: "Bot added to folder successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add bot to folder",
        variant: "destructive",
      });
      console.error("Error adding bot to folder:", error);
    }
  });

  const checkBackHalfAvailability = async (backHalf: string): Promise<boolean> => {
    try {
      setIsCheckingBackHalf(true);
      const { data, error } = await supabase
        .rpc('is_back_half_available', {
          back_half: backHalf
        });

      if (error) throw error;
      return data;
    } finally {
      setIsCheckingBackHalf(false);
    }
  };

  return {
    folders,
    isLoading,
    createFolder,
    addBotToFolder,
    checkBackHalfAvailability,
    isCheckingBackHalf
  };
};