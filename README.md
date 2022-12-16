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

---
