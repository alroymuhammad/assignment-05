ALTER TABLE agent_memory_session
  ADD COLUMN scope_key TEXT,
  ADD COLUMN session_id TEXT,
  ADD COLUMN user_id TEXT;

UPDATE agent_memory_session
SET
  scope_key = id::text,
  session_id = id::text,
  metadata = CASE
    WHEN title IS NULL THEN metadata
    ELSE jsonb_build_object('title', title) || metadata
  END;

ALTER TABLE agent_memory_session
  ALTER COLUMN scope_key SET NOT NULL,
  ALTER COLUMN session_id SET NOT NULL,
  ADD CONSTRAINT agent_memory_session_scope_key_key UNIQUE (scope_key),
  DROP COLUMN title;

CREATE INDEX agent_memory_session_user_updated_idx
  ON agent_memory_session (user_id, updated_at DESC);

ALTER TABLE agent_memory_message
  ADD COLUMN position INTEGER,
  ADD COLUMN run_id TEXT,
  ADD COLUMN turn INTEGER,
  ADD COLUMN message JSONB;

WITH positioned AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY session_id ORDER BY created_at, id)::integer AS position
  FROM agent_memory_message
)
UPDATE agent_memory_message AS stored
SET
  position = positioned.position,
  run_id = 'legacy',
  turn = 0,
  message = jsonb_build_object(
    'role', stored.role,
    'content', stored.content,
    'metadata', stored.metadata
  )
FROM positioned
WHERE positioned.id = stored.id;

ALTER TABLE agent_memory_message
  ALTER COLUMN position SET NOT NULL,
  ALTER COLUMN run_id SET NOT NULL,
  ALTER COLUMN turn SET NOT NULL,
  ALTER COLUMN message SET NOT NULL,
  ADD CONSTRAINT agent_memory_message_position_check CHECK (position > 0),
  ADD CONSTRAINT agent_memory_message_turn_check CHECK (turn >= 0),
  ADD CONSTRAINT agent_memory_message_session_position_key UNIQUE (session_id, position),
  DROP COLUMN role,
  DROP COLUMN content,
  DROP COLUMN metadata;

ALTER TABLE agent_memory_error
  ADD COLUMN run_id TEXT,
  ADD COLUMN error_name TEXT,
  ADD COLUMN error_message TEXT,
  ADD COLUMN error_stack TEXT,
  ADD COLUMN messages JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE agent_memory_error
SET
  run_id = 'legacy',
  error_name = name,
  error_message = message,
  error_stack = stack;

ALTER TABLE agent_memory_error
  ALTER COLUMN run_id SET NOT NULL,
  ALTER COLUMN error_message SET NOT NULL,
  DROP COLUMN message_id,
  DROP COLUMN name,
  DROP COLUMN message,
  DROP COLUMN stack,
  DROP COLUMN metadata;
