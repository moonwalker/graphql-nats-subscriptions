import { PubSubEngine } from 'graphql-subscriptions';
import * as nats from 'nats';
export declare class NatsPubSub implements PubSubEngine {
    private nats;
    constructor(options: nats.ClientOpts & {
        nc?: nats.Client;
    });
    publish(subject: string, payload: any): Promise<void>;
    subscribe(subject: string, onMessage: Function): Promise<number>;
    unsubscribe(sid: number): void;
    asyncIterator<T>(subjects: string | string[]): AsyncIterator<T>;
}
