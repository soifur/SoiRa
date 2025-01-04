import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description: string | null;
  short_key: string | null;
  is_public: boolean;
}

interface CategoryFormProps {
  editingCategory: Category | null;
  onSave: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onChange: (field: keyof Category, value: any) => void;
}

export const CategoryForm = ({
  editingCategory,
  onSave,
  onCancel,
  onChange,
}: CategoryFormProps) => {
  if (!editingCategory) return null;

  return (
    <Card className="p-4">
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <Input
            placeholder="Category Name"
            value={editingCategory.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            placeholder="Description"
            value={editingCategory.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_public"
            checked={editingCategory.is_public}
            onChange={(e) => onChange("is_public", e.target.checked)}
          />
          <label htmlFor="is_public">Make Public</label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">
            {editingCategory.id ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};