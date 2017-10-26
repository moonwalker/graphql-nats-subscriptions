"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nats_1 = require("nats");
var pubsub_async_iterator_1 = require("./pubsub-async-iterator");
var PubSub = /** @class */ (function () {
    function PubSub(options) {
        if (options === void 0) { options = {}; }
        this.nats = nats_1.connect(options.natsUrl || 'nats://127.0.0.1:4222');
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
        return new pubsub_async_iterator_1.PubSubAsyncIterator(this, subjects);
    };
    return PubSub;
}());
exports.PubSub = PubSub;
