# Serverless chat (websocket)

| 프로젝트 기간 | 22.12.16 ~                                                                |
| ------------- | ------------------------------------------------------------------------- |
| 프로젝트 목적 | Serverless websocket with cloudflare durable objects                      |
| Github        |                                                                           |
| Docs          | https://developers.cloudflare.com/workers/learning/using-durable-objects/ |

---

## Durable Objects ?

- low-latency coordination
- consistent storage

cloudflare worker를 사용하는 경우 코드는 cloudflare 각 지역으로 복사된다.

한국에 있는 유저는 한국 region의 코드가 실행되고, 미국에 있는 유저는 미국 region에 저장된 코드가 실행된다. → 즉, 코드는 동일하지만 다른 컴퓨터에서 실행되기 때문에 state를 가지지 않는다.

State를 유지하는 방법에는 KV database가 있는데 chat state를 저장하기에는 적합하지 않다.

Durable object는 javascript class를 cloudflare 메모리에 저장하고, 모든 workers가 이 메모리에 접근할 수 있다.

Durable object는 worker에 의해 호출되며, worker는 user에 의해 호출된다.

(user가 direct로 durable object를 호출할 수 없다)

---

unique Id로 cloudflare instance를 생성하고 관리하도록
cloudflare는 class를 기억하기 때문에 어느곳이든 동일한 state를 사용할 수 있다.

wrangler.toml

```toml
[durable_objects]
bindings = [
    {name = 'COUNTER', class_name = 'CounterObject'}
]
```

index.ts

```tsx
export interface Env {
  COUNTER: DurableObjectNamespace;
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
```
