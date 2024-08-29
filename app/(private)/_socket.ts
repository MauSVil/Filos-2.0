import io from 'socket.io-client';

let socketVar;

if (!socketVar) {
  socketVar = io('https://filosbot.mausvil.dev');
}

export const socket = socketVar;