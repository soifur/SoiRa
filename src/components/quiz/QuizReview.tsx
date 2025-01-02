import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizConfiguration, QuizHistory } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface QuizReviewProps {
  quiz: QuizConfiguration;
  onClose: () => void;
}

export const QuizReview = ({ quiz, onClose }: QuizReviewProps) => {
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizHistory | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("quiz_history")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Map the database response to match our TypeScript interface
        const mappedData: QuizHistory[] = data.map((item) => ({
          id: item.id,
          quizId: item.quiz_id,
          sessionToken: item.session_token,
          userId: item.user_id,
          answers: item.answers,
          score: item.score || 0,
          status: item.status || 'completed',
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));

        setHistory(mappedData);
        if (mappedData.length > 0) {
          setSelectedAttempt(mappedData[0]);
        }
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [quiz.id]);

  if (isLoading) {
    return <div className="text-center py-8">Loading quiz history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-center py-8">
          No attempts found for this quiz
        </div>
      </div>
    );
  }

  const renderQuestion = (questionId: string, selectedOptionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return null;

    const correctOption = question.options.find((o) => o.isCorrect);
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    const isCorrect = correctOption?.id === selectedOptionId;

    return (
      <Card key={questionId} className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{question.text}</p>
            <div className="mt-2 space-y-1">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`p-2 rounded ${
                    option.id === selectedOptionId
                      ? option.isCorrect
                        ? "bg-green-100"
                        : "bg-red-100"
                      : option.isCorrect
                      ? "bg-green-50"
                      : ""
                  }`}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {history.length} attempt{history.length !== 1 ? "s" : ""}
        </div>
      </div>

      {selectedAttempt && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Score: {selectedAttempt.score}%
            </h3>
            <span className="text-sm text-muted-foreground">
              {new Date(selectedAttempt.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-4">
            {selectedAttempt.answers.map((answer) =>
              renderQuestion(answer.questionId, answer.selectedOptionId)
            )}
          </div>
        </div>
      )}
    </div>
  );
};