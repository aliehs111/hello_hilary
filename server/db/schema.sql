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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  media_type text NOT NULL CHECK (media_type IN ('photo','video')),

  status text NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded','processing','ready','failed')),

  original_key text NOT NULL,
  playback_key text,
  thumbnail_key text,

  title text,
  caption text,

  category text,

  is_featured boolean DEFAULT false,
  is_hidden boolean DEFAULT false,

  original_filename text,
  mime_type text,
  size_bytes bigint,

  error_message text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_created_at
  ON media(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_user_created
  ON media(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_category
  ON media(category);

CREATE INDEX IF NOT EXISTS idx_media_title_caption
ON media USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(caption,'')));

INSERT INTO users (email, display_name, role)
VALUES ('sheila@hello-hilary.com', 'Sheila', 'admin')
ON CONFLICT (email) DO NOTHING;