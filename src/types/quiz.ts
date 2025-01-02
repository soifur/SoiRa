export interface QuizQuestion {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface QuizConfiguration {
  id: string;
  botId: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
  branchingLogic?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface QuizHistory {
  id: string;
  quizId: string;
  sessionToken?: string;
  userId?: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
  score?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}