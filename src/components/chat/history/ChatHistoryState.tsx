import { useState, useEffect } from "react";
import { ChatsByModelAndDate } from "./types";
import { DATE_GROUP_ORDER } from "@/utils/dateUtils";

const EXPANDED_GROUPS_KEY = 'chatHistory:expandedGroups';
const EXPANDED_MODELS_KEY = 'chatHistory:expandedModels';

export const useChatHistoryState = (chatsByModelAndDate: ChatsByModelAndDate) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const savedGroups = localStorage.getItem(EXPANDED_GROUPS_KEY);
    return savedGroups ? new Set(JSON.parse(savedGroups)) : new Set(DATE_GROUP_ORDER);
  });

  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => {
    const savedModels = localStorage.getItem(EXPANDED_MODELS_KEY);
    return savedModels ? new Set(JSON.parse(savedModels)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(EXPANDED_GROUPS_KEY, JSON.stringify(Array.from(expandedGroups)));
  }, [expandedGroups]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_MODELS_KEY, JSON.stringify(Array.from(expandedModels)));
  }, [expandedModels]);

  useEffect(() => {
    const modelNames = Object.keys(chatsByModelAndDate);
    if (modelNames.length > 0) {
      const savedModels = localStorage.getItem(EXPANDED_MODELS_KEY);
      if (!savedModels) {
        setExpandedModels(new Set(modelNames));
      }
    }
  }, [chatsByModelAndDate]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleModel = (modelName: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  return {
    expandedGroups,
    expandedModels,
    toggleGroup,
    toggleModel
  };
};