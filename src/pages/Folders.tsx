import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFolders } from "@/hooks/useFolders";
import { useToast } from "@/components/ui/use-toast";
import { Folder, Plus } from "lucide-react";

export default function Folders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { folders, isLoading, createFolder, checkBackHalfAvailability } = useFolders();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backHalf, setBackHalf] = useState("");
  const [allowSignups, setAllowSignups] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCreate = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (backHalf) {
      setIsChecking(true);
      const isAvailable = await checkBackHalfAvailability(backHalf);
      setIsChecking(false);

      if (!isAvailable) {
        toast({
          title: "Error",
          description: "This back-half is already taken",
          variant: "destructive",
        });
        return;
      }
    }

    await createFolder.mutateAsync({
      title,
      description: description || null,
      back_half: backHalf || null,
      allow_signups: allowSignups,
    });

    setIsOpen(false);
    setTitle("");
    setDescription("");
    setBackHalf("");
    setAllowSignups(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Folders</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter folder title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter folder description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backHalf">Custom URL Back-half</Label>
                <Input
                  id="backHalf"
                  value={backHalf}
                  onChange={(e) => setBackHalf(e.target.value)}
                  placeholder="e.g., my-custom-url"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowSignups"
                  checked={allowSignups}
                  onCheckedChange={setAllowSignups}
                />
                <Label htmlFor="allowSignups">Allow User Signups</Label>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!title || isChecking || createFolder.isPending}
                className="w-full"
              >
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Folder className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">{folder.title}</h3>
                    {folder.description && (
                      <p className="text-sm text-muted-foreground">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {folder.back_half && (
                <div className="mt-2 text-sm text-muted-foreground">
                  URL: /{folder.back_half}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/folders/${folder.id}`)}
                >
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};