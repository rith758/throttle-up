
-- Create connection_status enum
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted');

-- Create connections table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT connections_unique_pair UNIQUE (sender_id, receiver_id),
  CONSTRAINT connections_no_self CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can only see connections they're part of
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send connection requests
CREATE POLICY "Users can send requests"
  ON public.connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Receiver can update (accept) a connection
CREATE POLICY "Receiver can update connection"
  ON public.connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Either party can delete (ignore/remove) a connection
CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Add social fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_link TEXT DEFAULT '';
