-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nicho TEXT NOT NULL,
  cidade TEXT NOT NULL,
  meta_diaria INTEGER,
  name TEXT NOT NULL,
  website TEXT,
  social TEXT,
  digital_signals TEXT,
  revenue_estimate TEXT,
  commercial_structure TEXT,
  momento_gatilho TEXT,
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  matched_criteria JSONB DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'respondeu', 'sem_interesse', 'convertido')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_user_id ON leads(user_id);

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own leads"
  ON leads FOR ALL USING (auth.uid() = user_id);
