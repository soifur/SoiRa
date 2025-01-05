import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface StartersInputProps {
  starters: string[];
  onStartersChange: (starters: string[]) => void;
}

export const StartersInput = ({ starters, onStartersChange }: StartersInputProps) => {
  const [newStarter, setNewStarter] = useState("");

  const addStarter = () => {
    if (!newStarter.trim()) return;
    onStartersChange([...starters, newStarter.trim()]);
    setNewStarter("");
  };

  const removeStarter = (index: number) => {
    onStartersChange(starters.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStarter();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Conversation Starters</label>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <Input
            value={newStarter}
            onChange={(e) => setNewStarter(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a conversation starter"
            className="dark:bg-[#1e1e1e] dark:border-gray-700 w-full"
          />
        </div>
        <Button 
          onClick={addStarter}
          className="shrink-0" // Prevent button from shrinking
        >
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {starters.map((starter, index) => (
          <div key={index} className="flex items-center gap-2 p-2 rounded dark:bg-[#1e1e1e] dark:border-gray-700 border">
            <span className="flex-1 break-words">{starter}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeStarter(index)}
              className="shrink-0" // Prevent button from shrinking
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};