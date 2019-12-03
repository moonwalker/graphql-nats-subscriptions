import { PubSubAsyncIterator } from './pubsub-async-iterator'
import { PubSubEngine } from 'graphql-subscriptions'
import * as nats from 'nats'

export class NatsPubSub implements PubSubEngine {
  private nats: nats.Client

  constructor(options: nats.ClientOpts & { nc?: nats.Client }) {
    if (options.nc) {
      this.nats = options.nc
    } else {
      this.nats = nats.connect(options)
    }
  }

  public async publish(subject: string, payload: any): Promise<void> {
    return await this.nats.publish(subject, JSON.stringify(payload))
  }

  public async subscribe(subject: string, onMessage: Function): Promise<number> {
    return await this.nats.subscribe(subject, (event: string) => onMessage(JSON.parse(event)))
  }

  public unsubscribe(sid: number) {
    this.nats.unsubscribe(sid)
  }

  public asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects)
  }
}
