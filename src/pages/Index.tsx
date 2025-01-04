import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  short_key: string | null;
  is_public: boolean;
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        navigate('/login');
        return;
      }

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        navigate('/login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
      fetchCategories();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_categories')
        .select('*')
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const { name, description, is_public } = editingCategory;
    const isNew = !editingCategory.id;

    try {
      if (isNew) {
        const { error } = await supabase
          .from('bot_categories')
          .insert({ name, description, is_public });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bot_categories')
          .update({ name, description, is_public })
          .eq('id', editingCategory.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Category ${isNew ? 'created' : 'updated'} successfully`,
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bot_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard`,
      });
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl pt-20 px-4">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const baseUrl = window.location.origin;

  return (
    <div className="container mx-auto max-w-7xl pt-20 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <Button
            onClick={() =>
              setEditingCategory({
                id: "",
                name: "",
                description: "",
                short_key: null,
                is_public: false,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> New Category
          </Button>
        </div>

        {editingCategory && (
          <Card className="p-4">
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <Input
                  placeholder="Category Name"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Description"
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editingCategory.is_public}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      is_public: e.target.checked,
                    })
                  }
                />
                <label htmlFor="is_public">Make Public</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory.id ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  {category.is_public && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                      Public
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {category.short_key && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShareDialogOpen(true);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Public Link</h3>
                <div className="flex gap-2">
                  <Input
                    value={`${baseUrl}/category/${selectedCategory.short_key}`}
                    readOnly
                  />
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        `${baseUrl}/category/${selectedCategory.short_key}`,
                        "Public link"
                      )
                    }
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
