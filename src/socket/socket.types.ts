export enum SocketEvents {
  NOTIFICATION = 'notification',

  JOIN_CHAT = 'joinChat',

  MESSAGE_SEND = 'message:send',
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_READ = 'message:read',
  CHAT_HISTORY = 'chat:history',
  MORE_CHAT_HISTORY = 'chat:moreHistory',
  LOAD_MORE_MESSAGES = 'chat:loadMoreMessages',

  // Typing indicators
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}
