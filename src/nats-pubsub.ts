import { PubSubAsyncIterator } from './pubsub-async-iterator'
import { PubSubEngine } from 'graphql-subscriptions'
import * as nats from 'nats'

const defaultOptions = { json: true }
export class NatsPubSub implements PubSubEngine {
  private nats: nats.Client
  private json: Boolean

  constructor(options: nats.ClientOpts & { nc?: nats.Client }) {
    if (options.nc) {
      this.nats = options.nc
    } else {
      this.nats = nats.connect(options)
    }
    
    this.json = this.nats.options.json === true
  }

  public async publish(subject: string, payload: any): Promise<void> {
    if (!this.json) payload = JSON.stringify(payload)
    return await this.nats.publish(subject, payload)
  }

  public async subscribe(subject: string, onMessage: Function): Promise<number> {
    if (!this.json) onMessage = (event: string) => onMessage(JSON.parse(event))
    return await this.nats.subscribe(subject, onMessage)
  }

  public unsubscribe(sid: number) {
    this.nats.unsubscribe(sid)
  }

  public asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects)
  }
}
