CREATE TABLE agent_memory_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_memory_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES agent_memory_session(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (length(trim(role)) > 0),
  content JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX agent_memory_message_session_created_idx
  ON agent_memory_message (session_id, created_at, id);

CREATE TABLE agent_memory_error (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_memory_session(id) ON DELETE CASCADE,
  message_id UUID REFERENCES agent_memory_message(id) ON DELETE SET NULL,
  name TEXT,
  message TEXT NOT NULL CHECK (length(trim(message)) > 0),
  stack TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX agent_memory_error_session_created_idx
  ON agent_memory_error (session_id, created_at, id);
