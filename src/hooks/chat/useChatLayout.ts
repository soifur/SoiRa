import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const useChatLayout = (showHistory: boolean) => {
  const isMobile = useIsMobile();

  const layoutClasses = useMemo(() => ({
    container: cn(
      "relative flex flex-col h-full",
      "transition-[margin] duration-300 ease-in-out",
      !isMobile && showHistory && "ml-64"
    ),
    inputContainer: cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t",
      "transition-[left,right] duration-300 ease-in-out",
      !isMobile && showHistory && "left-64"
    )
  }), [isMobile, showHistory]);

  return { layoutClasses, isMobile };
};