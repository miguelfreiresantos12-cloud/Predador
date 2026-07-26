export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  created_at: string;
}

export interface Client {
  id: string;
  company_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  preferences?: Record<string, any>;
  objections?: string[];
  company?: Company;
}

export interface Meeting {
  id: string;
  user_id: string;
  client_id?: string;
  title: string;
  started_at: string;
  duration_seconds: number;
  audio_url?: string;
  transcription?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  source: 'upload' | 'meet' | 'zoom' | 'teams' | 'phone';
  status: 'pending' | 'transcribing' | 'analyzed' | 'archived';
  client?: Client;
  evaluation?: Evaluation;
  created_at: string;
}

export interface Evaluation {
  id: string;
  meeting_id: string;
  overall_score: number;
  rapport: number;
  active_listening: number;
  empathy: number;
  discovery: number;
  control: number;
  argumentation: number;
  objections_handling: number;
  clarity: number;
  confidence: number;
  closing: number;
  next_steps: number;
  feedback: {
    excellent: string;
    improve: string;
    next_steps: string;
  };
}

export interface Memory {
  id: string;
  user_id: string;
  client_id?: string;
  content: string;
  type: 'fact' | 'preference' | 'objection' | 'opportunity' | 'commitment';
  created_at: string;
}

export interface Briefing {
  id: string;
  user_id: string;
  date: string;
  summary?: string;
  impact?: string;
  opportunities?: string;
  risks?: string;
  suggestions?: string;
}

export interface Task {
  id: string;
  user_id: string;
  meeting_id?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
}
