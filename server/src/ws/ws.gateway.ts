import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.id;

    this.clients.set(userId, client);
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.clients.entries()).find(([, c]) => c.id === client.id)?.[0];

    if (userId) {
      this.clients.delete(userId);
    }
  }

  sendToUser(event: string, data: any = '') {
    const payload = JSON.stringify(data);

    for (const client of this.clients.values()) {
      client.emit(event, payload);
    }
  }
}
