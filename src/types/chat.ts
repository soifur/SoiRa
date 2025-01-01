export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

export interface Bot {
  id: string;
  name: string;
  instructions?: string;
  starters: string[];
  model: string;
  avatar?: string;
}