-- Function to get or create a direct conversation
-- This runs with SECURITY DEFINER to bypass RLS for creating conversations/participants
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Check if a direct conversation already exists
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.is_group = false
    AND cp1.user_id = auth.uid()
    AND cp2.user_id = other_user_id
  LIMIT 1;

  -- If found, return it
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  -- Otherwise, create a new one
  INSERT INTO conversations (is_group)
  VALUES (false)
  RETURNING id INTO conv_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (conv_id, auth.uid());

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (conv_id, other_user_id);

  RETURN conv_id;
END;
$$;
