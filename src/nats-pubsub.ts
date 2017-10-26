import { connect, Client } from 'nats'
import { PubSubEngine } from 'graphql-subscriptions'
import { PubSubAsyncIterator } from './pubsub-async-iterator'

export interface NatsPubSubOptions {
  natsUrl?: string
}

export class PubSub implements PubSubEngine {
  private nats: Client

  constructor(options: NatsPubSubOptions = {}) {
    this.nats = connect(options.natsUrl || 'nats://127.0.0.1:4222')
  }

  publish(subject: string, payload: any): boolean {
    this.nats.publish(subject, JSON.stringify(payload))
    return true
  }

  subscribe(subject: string, onMessage: Function): Promise<number> {
    const sid = this.nats.subscribe(subject, msg => onMessage(JSON.parse(msg)))
    return Promise.resolve(sid)
  }

  public unsubscribe(sid: number) {
    this.nats.unsubscribe(sid)
  }

  public asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects)
  }
}
