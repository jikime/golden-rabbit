export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  created_at: string;
}; 