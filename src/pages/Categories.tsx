import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Folder, Plus, Trash2, Edit2, Share2, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useBots } from "@/hooks/useBots";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const { bots } = useBots();
  const { toast } = useToast();
  const baseUrl = window.location.origin;

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('bot_categories')
      .select(`
        *,
        bot_category_assignments (
          bot_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
      return;
    }

    setCategories(data || []);
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('bot_categories')
      .insert([{ name: newCategoryName }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Category created successfully",
    });
    setNewCategoryName("");
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('bot_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
    fetchCategories();
  };

  const startEditing = (category: any) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from('bot_categories')
      .update({ name: editName })
      .eq('id', editingCategory.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
      return;
    }

    setEditingCategory(null);
    fetchCategories();
  };

  const openBotDialog = async (category: any) => {
    const { data: assignments } = await supabase
      .from('bot_category_assignments')
      .select('bot_id')
      .eq('category_id', category.id);

    setSelectedBots((assignments || []).map(a => a.bot_id));
    setCurrentCategory(category);
    setShowBotDialog(true);
  };

  const saveBotAssignments = async () => {
    if (!currentCategory) return;

    // Delete existing assignments
    await supabase
      .from('bot_category_assignments')
      .delete()
      .eq('category_id', currentCategory.id);

    // Create new assignments
    if (selectedBots.length > 0) {
      const { error } = await supabase
        .from('bot_category_assignments')
        .insert(
          selectedBots.map(botId => ({
            category_id: currentCategory.id,
            bot_id: botId
          }))
        );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update bot assignments",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: "Bot assignments updated successfully",
    });
    setShowBotDialog(false);
    fetchCategories();
  };

  const shareCategory = async (category: any) => {
    const { error } = await supabase
      .from('bot_categories')
      .update({ is_public: true })
      .eq('id', category.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to share category",
        variant: "destructive",
      });
      return;
    }

    setShareUrl(`${baseUrl}/categories/${category.short_key}`);
    setShareDialogOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={createCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Folder className="h-5 w-5" />
                {editingCategory?.id === category.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={saveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{category.name}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(category)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openBotDialog(category)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => shareCategory(category)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {category.bot_category_assignments?.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                {category.bot_category_assignments.length} bot(s) assigned
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={showBotDialog} onOpenChange={setShowBotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Bots to Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center space-x-2">
                <Checkbox
                  id={bot.id}
                  checked={selectedBots.includes(bot.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBots([...selectedBots, bot.id]);
                    } else {
                      setSelectedBots(selectedBots.filter(id => id !== bot.id));
                    }
                  }}
                />
                <label htmlFor={bot.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {bot.name}
                </label>
              </div>
            ))}
            <Button onClick={saveBotAssignments} className="w-full">
              Save Assignments
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={shareUrl} readOnly />
            <Button onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast({
                title: "Success",
                description: "Share link copied to clipboard",
              });
            }} className="w-full">
              Copy Share Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}