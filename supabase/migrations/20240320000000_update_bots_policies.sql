-- Update the bots table policies to allow all authenticated users to view published bots
create policy "Users can view published bots"
on bots
for select
to authenticated
using (published = true);

-- Update the chat_history policies to allow users to create and manage their chat history
create policy "Users can create chat history"
on chat_history
for insert
to authenticated
with check (true);

create policy "Users can view their chat history"
on chat_history
for select
to authenticated
using (
  (user_id = auth.uid()) or
  (session_token = current_setting('request.headers')::json->>'cf-connecting-ip')
);

create policy "Users can update their chat history"
on chat_history
for update
to authenticated
using (
  (user_id = auth.uid()) or
  (session_token = current_setting('request.headers')::json->>'cf-connecting-ip')
);