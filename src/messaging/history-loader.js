import { loadPaginatedDataQuery } from '../data/initial-data-queries.js';

export async function loadConversationHistory(client, conversationId, safeQuery) {
  const id = String(conversationId || '');
  const [messages, attachments] = await Promise.all([
    loadPaginatedDataQuery(
      () => client.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: false }).order('id', { ascending: false }),
      safeQuery,
      { label: 'Conversation messages' },
    ),
    loadPaginatedDataQuery(
      () => client.from('message_attachments').select('*').eq('conversation_id', id).order('created_at', { ascending: false }).order('id', { ascending: false }),
      safeQuery,
      { label: 'Conversation attachments' },
    ),
  ]);
  return { messages, attachments, error: messages.error || attachments.error || null };
}
