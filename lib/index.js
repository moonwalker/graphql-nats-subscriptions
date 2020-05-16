'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var iterall = require('iterall');
var nats = require('nats');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class PubSubAsyncIterator {
    constructor(pubsub, eventNames) {
        this.pubsub = pubsub;
        this.pullQueue = [];
        this.pushQueue = [];
        this.listening = true;
        this.eventsArray = typeof eventNames === 'string' ? [eventNames] : eventNames;
        this.allSubscribed = this.subscribeAll();
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.allSubscribed;
            return this.listening ? this.pullValue() : this.return();
        });
    }
    return() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emptyQueue(yield this.allSubscribed);
            return { value: undefined, done: true };
        });
    }
    throw(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emptyQueue(yield this.allSubscribed);
            return Promise.reject(error);
        });
    }
    [iterall.$$asyncIterator]() {
        return this;
    }
    pushValue(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.allSubscribed;
            if (this.pullQueue.length !== 0) {
                const cb = this.pullQueue.shift();
                if (!cb) {
                    return;
                }
                cb({ value: message, done: false });
            }
            else {
                this.pushQueue.push(message);
            }
        });
    }
    pullValue() {
        return new Promise(resolve => {
            if (this.pushQueue.length !== 0) {
                resolve({ value: this.pushQueue.shift(), done: false });
            }
            else {
                this.pullQueue.push(resolve);
            }
        });
    }
    emptyQueue(subscriptionIds) {
        if (this.listening) {
            this.listening = false;
            this.unsubscribeAll(subscriptionIds);
            this.pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
            this.pullQueue.length = 0;
            this.pushQueue.length = 0;
        }
    }
    subscribeAll() {
        return Promise.all(this.eventsArray.map(eventName => this.pubsub.subscribe(eventName, this.pushValue.bind(this), {})));
    }
    unsubscribeAll(subscriptionIds) {
        for (const subscriptionId of subscriptionIds) {
            this.pubsub.unsubscribe(subscriptionId);
        }
    }
}

class NatsPubSub {
    constructor(options) {
        if (options.nc) {
            this.nats = options.nc;
        }
        else {
            this.nats = nats.connect(options);
        }
    }
    publish(subject, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.nats.publish(subject, JSON.stringify(payload));
        });
    }
    subscribe(subject, onMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.nats.subscribe(subject, (event) => {
                var payload;
                try {
                    payload = JSON.parse(event);
                }
                catch (e) {
                    payload = event;
                }
                onMessage(payload);
            });
        });
    }
    unsubscribe(sid) {
        this.nats.unsubscribe(sid);
    }
    asyncIterator(subjects) {
        return new PubSubAsyncIterator(this, subjects);
    }
}

exports.NatsPubSub = NatsPubSub;
exports.PubSubAsyncIterator = PubSubAsyncIterator;
