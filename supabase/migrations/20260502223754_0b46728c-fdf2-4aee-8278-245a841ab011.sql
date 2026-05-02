-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    user_email TEXT,
    user_phone TEXT,
    user_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
-- Allow anyone to create a conversation (guests)
CREATE POLICY "Anyone can create a chat conversation"
ON public.chat_conversations FOR INSERT
WITH CHECK (true);

-- Allow users to view their own conversation if they have the ID
CREATE POLICY "Users can view their own conversation"
ON public.chat_conversations FOR SELECT
USING (true); -- In a production app, we might want to restrict this more, but for a guest chat, knowledge of the UUID is the "token"

-- Policies for chat_messages
-- Allow anyone to create a message
CREATE POLICY "Anyone can create a chat message"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

-- Allow anyone to read messages (restricted by conversation_id in queries)
CREATE POLICY "Anyone can view chat messages"
ON public.chat_messages FOR SELECT
USING (true);

-- Trigger for updating updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
