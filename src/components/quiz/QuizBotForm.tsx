import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const quizBotSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  passing_score: z.number().min(0).max(100).default(75),
  instructions: z.string().optional(),
});

type QuizBotFormValues = z.infer<typeof quizBotSchema>;

interface QuizBot {
  id?: string;
  title: string;
  description?: string;
  passing_score: number;
  instructions?: string;
}

interface QuizBotFormProps {
  onSave: (bot: QuizBot) => void;
  onCancel: () => void;
  initialData?: QuizBot;
}

export const QuizBotForm = ({ onSave, onCancel, initialData }: QuizBotFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<QuizBotFormValues>({
    resolver: zodResolver(quizBotSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      passing_score: initialData?.passing_score || 75,
      instructions: initialData?.instructions || "",
    },
  });

  const onSubmit = async (values: QuizBotFormValues) => {
    try {
      await onSave({
        ...initialData,
        ...values,
      });
      toast({
        title: "Success",
        description: `Quiz bot ${initialData ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving quiz bot:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz bot",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter quiz title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passing_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passing Score (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter quiz instructions"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};