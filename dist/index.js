'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var nats = require('nats');
var iterall = require('iterall');

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
}

/**
 * A class for digesting PubSubEngine events via the new AsyncIterator interface.
 * This implementation is a generic version of the one located at
 * https://github.com/apollographql/graphql-subscriptions/blob/master/src/event-emitter-to-async-iterator.ts
 * @class
 *
 * @constructor
 *
 * @property pullQueue @type {Function[]}
 * A queue of resolve functions waiting for an incoming event which has not yet arrived.
 * This queue expands as next() calls are made without PubSubEngine events occurring in between.
 *
 * @property pushQueue @type {any[]}
 * A queue of PubSubEngine events waiting for next() calls to be made.
 * This queue expands as PubSubEngine events arrive without next() calls occurring in between.
 *
 * @property eventsArray @type {string[]}
 * An array of PubSubEngine event names which this PubSubAsyncIterator should watch.
 *
 * @property allSubscribed @type {Promise<number[]>}
 * A promise of a list of all subscription ids to the passed PubSubEngine.
 *
 * @property listening @type {boolean}
 * Whether or not the PubSubAsynIterator is in listening mode (responding to incoming PubSubEngine events and next() calls).
 * Listening begins as true and turns to false once the return method is called.
 *
 * @property pubsub @type {PubSubEngine}
 * The PubSubEngine whose events will be observed.
 */
var PubSubAsyncIterator = /** @class */ (function () {
    function PubSubAsyncIterator(pubsub, eventNames) {
        this.pubsub = pubsub;
        this.pullQueue = [];
        this.pushQueue = [];
        this.listening = true;
        this.eventsArray = typeof eventNames === 'string' ? [eventNames] : eventNames;
        this.allSubscribed = this.subscribeAll();
    }
    PubSubAsyncIterator.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.allSubscribed];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.listening ? this.pullValue() : this.return()];
                }
            });
        });
    };
    PubSubAsyncIterator.prototype.return = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.emptyQueue;
                        return [4 /*yield*/, this.allSubscribed];
                    case 1:
                        _a.apply(this, [_b.sent()]);
                        return [2 /*return*/, { value: undefined, done: true }];
                }
            });
        });
    };
    PubSubAsyncIterator.prototype.throw = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.emptyQueue;
                        return [4 /*yield*/, this.allSubscribed];
                    case 1:
                        _a.apply(this, [_b.sent()]);
                        return [2 /*return*/, Promise.reject(error)];
                }
            });
        });
    };
    PubSubAsyncIterator.prototype[iterall.$$asyncIterator] = function () {
        return this;
    };
    PubSubAsyncIterator.prototype.pushValue = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.allSubscribed];
                    case 1:
                        _a.sent();
                        if (this.pullQueue.length !== 0) {
                            this.pullQueue.shift()({ value: message, done: false });
                        }
                        else {
                            this.pushQueue.push(message);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PubSubAsyncIterator.prototype.pullValue = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.pushQueue.length !== 0) {
                resolve({ value: _this.pushQueue.shift(), done: false });
            }
            else {
                _this.pullQueue.push(resolve);
            }
        });
    };
    PubSubAsyncIterator.prototype.emptyQueue = function (subscriptionIds) {
        if (this.listening) {
            this.listening = false;
            this.unsubscribeAll(subscriptionIds);
            this.pullQueue.forEach(function (resolve) { return resolve({ value: undefined, done: true }); });
            this.pullQueue.length = 0;
            this.pushQueue.length = 0;
        }
    };
    PubSubAsyncIterator.prototype.subscribeAll = function () {
        var _this = this;
        return Promise.all(this.eventsArray.map(function (eventName) { return _this.pubsub.subscribe(eventName, _this.pushValue.bind(_this), {}); }));
    };
    PubSubAsyncIterator.prototype.unsubscribeAll = function (subscriptionIds) {
        for (var _i = 0, subscriptionIds_1 = subscriptionIds; _i < subscriptionIds_1.length; _i++) {
            var subscriptionId = subscriptionIds_1[_i];
            this.pubsub.unsubscribe(subscriptionId);
        }
    };
    return PubSubAsyncIterator;
}());

var PubSub = /** @class */ (function () {
    function PubSub(options) {
        if (options === void 0) { options = {}; }
        this.nats = nats.connect(options.natsUrl || 'nats://127.0.0.1:4222');
    }
    PubSub.prototype.publish = function (subject, payload) {
        this.nats.publish(subject, JSON.stringify(payload));
        return true;
    };
    PubSub.prototype.subscribe = function (subject, onMessage) {
        var sid = this.nats.subscribe(subject, function (msg) { return onMessage(JSON.parse(msg)); });
        return Promise.resolve(sid);
    };
    PubSub.prototype.unsubscribe = function (sid) {
        this.nats.unsubscribe(sid);
    };
    PubSub.prototype.asyncIterator = function (subjects) {
        return new PubSubAsyncIterator(this, subjects);
    };
    return PubSub;
}());

exports.PubSub = PubSub;
