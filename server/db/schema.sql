CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_enabled    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- MEDIA
CREATE TABLE IF NOT EXISTS media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('photo','video')),
  title        text NULL,
  message      text NULL,

  storage_key  text NULL,
  content_type text NULL,
  bytes        bigint NULL,

  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_user_created ON media(user_id, created_at DESC);

INSERT INTO users (email, display_name, role)
VALUES ('sheila@hello-hilary.com', 'Sheila', 'admin');