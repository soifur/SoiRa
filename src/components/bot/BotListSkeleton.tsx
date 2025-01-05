import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const BotListSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};