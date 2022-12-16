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
  COUNTER: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

// @ts-ignore
import home from './home.html';

function handleHome() {
  return new Response(home, {
    headers: {
      'Content-Type': 'text/html;chartset=utf-8',
    },
  });
}

function handleNotFound() {
  return new Response(null, {
    status: 404,
  });
}

export class CounterObject {
  counter: number;
  constructor() {
    this.counter = 0;
  }
  async fetch(request: Request) {
    const { pathname } = new URL(request.url);
    switch (pathname) {
      case '/':
        return new Response(JSON.stringify({ counter: this.counter }));
      case '/+':
        this.counter++;
        return new Response(JSON.stringify({ counter: this.counter }));
      case '/-':
        this.counter--;
        return new Response(JSON.stringify({ counter: this.counter }));
      default:
        return handleNotFound();
    }
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const id = env.COUNTER.idFromName('counter');
    // durable object가 있다면 반환하고, 없으면 생성하고 초기화
    const durableObject = env.COUNTER.get(id);
    const response = await durableObject.fetch(request);
    return response;
  },
};
