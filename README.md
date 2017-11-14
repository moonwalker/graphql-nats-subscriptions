# GraphQL subscriptions over NATS

Apollo GraphQL subscriptions over NATS

## Usage

```javascript
import { PubSub } from '@moonwalker/graphql-nats-subscriptions'

export const pubsub = new PubSub({
  natsUrl: 'nats://127.0.0.1:4222'
})
```
