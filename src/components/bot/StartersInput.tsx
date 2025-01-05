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
    <div className="space-y-4">
      <label className="block text-sm font-medium">Conversation Starters</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            value={newStarter}
            onChange={(e) => setNewStarter(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a conversation starter"
            className="w-full dark:bg-[#1e1e1e] dark:border-gray-700"
          />
        </div>
        <Button 
          onClick={addStarter}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          Add Starter
        </Button>
      </div>
      <div className="grid gap-2">
        {starters.map((starter, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 p-3 rounded bg-background border dark:bg-[#1e1e1e] dark:border-gray-700"
          >
            <span className="flex-1 min-w-0 break-words">{starter}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeStarter(index)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};