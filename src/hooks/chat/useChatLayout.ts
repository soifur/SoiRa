import { useMemo } from "react";
import { cn } from "@/lib/utils";

export const useChatLayout = (showHistory: boolean) => {
  const layoutClasses = useMemo(() => ({
    container: cn(
      "relative flex flex-col h-full",
      "transition-[margin] duration-300 ease-in-out",
      showHistory ? "ml-64" : "ml-0"
    ),
    inputContainer: cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t",
      "transition-[left] duration-300 ease-in-out",
      showHistory ? "left-64" : "left-0"
    )
  }), [showHistory]);

  return { layoutClasses };
};