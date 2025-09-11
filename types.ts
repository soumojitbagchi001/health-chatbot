export enum Author {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: Author;
  text: string;
  isError?: boolean;
}
