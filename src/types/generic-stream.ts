import WebSocket from 'ws';
import { StreamPayload } from './trading';

export class GenericStream {
  socket: WebSocket;
  endpoint: string;
  callback: (payload: StreamPayload) => void;

  constructor(
    callback: (payload: StreamPayload) => void,
    endpoint: string
  ) {
    this.callback = callback;
    this.endpoint = endpoint;
  }

  reset( streamsString: string ) {}

  close() {
    this.socket.close();
    this.socket = undefined;
  }
}
