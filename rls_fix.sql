-- Fix RLS Recursion using Security Definer Function

-- 1. Create a helper function to get user's conversations
-- This runs with security definer privileges to bypass RLS recursion
create or replace function get_user_conversation_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select conversation_id 
  from conversation_participants 
  where user_id = auth.uid()
$$;

-- 2. Update Conversations Policy
drop policy if exists "Conversations are viewable by participants." on public.conversations;

create policy "Conversations are viewable by participants."
  on public.conversations for select
  using (
    id in (select get_user_conversation_ids())
  );

-- 3. Update Conversation Participants Policy
drop policy if exists "Participants can view other participants." on public.conversation_participants;

create policy "Participants can view other participants."
  on public.conversation_participants for select
  using (
    conversation_id in (select get_user_conversation_ids())
  );

-- 4. Update Messages Policy (Optional, but good for consistency)
drop policy if exists "Messages are viewable by conversation participants." on public.messages;

create policy "Messages are viewable by conversation participants."
  on public.messages for select
  using (
    conversation_id in (select get_user_conversation_ids())
  );
  
-- 5. Enable RLS on all tables (just in case)
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;
