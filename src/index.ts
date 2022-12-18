/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  CHAT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

// @ts-ignore
import home from './home.html';

export class ChatRoom {
  state: DurableObjectState;
  users: WebSocket[];
  messages: string[];
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.users = [];
    this.messages = [];
  }

  handleHome() {
    return new Response(home, {
      headers: {
        'Content-Type': 'text/html;chartset=utf-8',
      },
    });
  }

  handleNotFound() {
    return new Response(null, {
      status: 404,
    });
  }

  handleWebSocket(webSocket: WebSocket) {
    webSocket.accept();
    this.users.push(webSocket);
    webSocket.send(JSON.stringify({ message: '✨ connection completed' }));
    this.messages.forEach((message) => webSocket.send(message));

    webSocket.addEventListener('message', (event) => {
      this.messages.push(event.data.toString());
      this.users.forEach((user) => user.send(event.data));
    });
  }

  // browser - server webSocket connect
  handleConnect(request: Request) {
    const pairs = new WebSocketPair();
    this.handleWebSocket(pairs[1]); // backend
    return new Response(null, {
      status: 101, // switch protocol http -> ws
      webSocket: pairs[0], // browser
    });
  }

  async fetch(request: Request) {
    const { pathname } = new URL(request.url);
    switch (pathname) {
      case '/':
        return this.handleHome();
      case '/connect':
        return this.handleConnect(request);
      default:
        return this.handleNotFound();
    }
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const id = env.CHAT.idFromName('CHAT');
    // durable object가 있다면 반환하고, 없으면 생성하고 초기화
    const durableObject = env.CHAT.get(id);
    const response = await durableObject.fetch(request);
    return response;
  },
};
