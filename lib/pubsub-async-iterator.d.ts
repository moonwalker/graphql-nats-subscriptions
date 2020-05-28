import { $$asyncIterator } from 'iterall';
import { PubSubEngine } from 'graphql-subscriptions';
export declare class PubSubAsyncIterator<T> implements AsyncIterator<T> {
    constructor(pubsub: PubSubEngine, eventNames: string | string[]);
    next(): Promise<IteratorResult<any, any>>;
    return(): Promise<IteratorResult<any>>;
    throw(error: Error): Promise<never>;
    [$$asyncIterator](): this;
    private pullQueue;
    private pushQueue;
    private eventsArray;
    private allSubscribed;
    private listening;
    private pubsub;
    private pushValue;
    private pullValue;
    private emptyQueue;
    private subscribeAll;
    private unsubscribeAll;
}
