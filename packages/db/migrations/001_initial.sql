-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  preferences JSONB DEFAULT '{}',
  objections TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  audio_url TEXT,
  transcription TEXT,
  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'meet', 'zoom', 'teams', 'phone')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'analyzed', 'archived')),
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  rapport DECIMAL(3,1) CHECK (rapport >= 0 AND rapport <= 10),
  active_listening DECIMAL(3,1) CHECK (active_listening >= 0 AND active_listening <= 10),
  empathy DECIMAL(3,1) CHECK (empathy >= 0 AND empathy <= 10),
  discovery DECIMAL(3,1) CHECK (discovery >= 0 AND discovery <= 10),
  control DECIMAL(3,1) CHECK (control >= 0 AND control <= 10),
  argumentation DECIMAL(3,1) CHECK (argumentation >= 0 AND argumentation <= 10),
  objections_handling DECIMAL(3,1) CHECK (objections_handling >= 0 AND objections_handling <= 10),
  clarity DECIMAL(3,1) CHECK (clarity >= 0 AND clarity <= 10),
  confidence DECIMAL(3,1) CHECK (confidence >= 0 AND confidence <= 10),
  closing DECIMAL(3,1) CHECK (closing >= 0 AND closing <= 10),
  next_steps DECIMAL(3,1) CHECK (next_steps >= 0 AND next_steps <= 10),
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memories
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('fact', 'preference', 'objection', 'opportunity', 'commitment')),
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Briefings
CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT,
  impact TEXT,
  opportunities TEXT,
  risks TEXT,
  suggestions TEXT,
  sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_started_at ON meetings(started_at);
CREATE INDEX idx_evaluations_meeting_id ON evaluations(meeting_id);
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_client_id ON memories(client_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_briefings_user_date ON briefings(user_id, date);

-- Vector search indexes
CREATE INDEX idx_meetings_embedding ON meetings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_clients_embedding ON clients USING ivfflat (embedding vector_cosine_ops);

-- RLS Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own meetings"
  ON meetings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own evaluations"
  ON evaluations FOR ALL USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = evaluations.meeting_id AND meetings.user_id = auth.uid())
  );

CREATE POLICY "Users can only access their own clients"
  ON clients FOR ALL USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.client_id = clients.id AND meetings.user_id = auth.uid())
  );

CREATE POLICY "Users can only access their own memories"
  ON memories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own briefings"
  ON briefings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own tasks"
  ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own insights"
  ON insights FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for audio
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-uploads', 'audio-uploads', false);

CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own audio"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
  );
