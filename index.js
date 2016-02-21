
var _ = require('lodash');
var Maybe = require('maybe4js');

(function () {
    "use strict";

    var Store = function () {
        this.container = {};
    };

    Store.prototype.empty = function () {
        this.container = {};
    };

    Store.prototype.findById = function (_id) {
        if (!_id) {
            return new Maybe();
        }
        return new Maybe(this.container[_id]);
    };

    Store.prototype.find = function (finderFn) {
        return new Maybe(
            _.find(
                _.values(this.container),
                finderFn
            )
        );
    };

    Store.prototype.map = function (fn) {
        if (this.container) {
            return this.getAllValues().map(fn);
        }

        return [];
    };

    Store.prototype.fill = function (elements) {
        this.empty();
        if (_.isArray(elements)) {
            this.empty();
            elements.forEach(function (element) {
                this.container[element._id] = element;
            }.bind(this));
        } else {
            this.container = elements;
        }
    };

    Store.prototype.getAll = function () {
        return this.container;
    };

    Store.prototype.getAllValues = function () {
        return _.values(this.container);
    };

    Store.prototype.add = function (element) {
        this.container[element._id] = element;
    };

    Store.prototype.contains = function (id) {
        return !this.findById(id).isNull();
    };

    Store.prototype.isEmpty = function (id) {
        return Object.keys(this.container).length === 0;
    };

    Store.prototype.applyUpdate = function (update) {
        var self = this;
        _.keys(update).forEach(function (key) {
            var updates = null;
            if (key === '$set') {
                updates = update.$set;

                _.keys(updates).forEach(function (setter) {
                    var path = setter;
                    var value = updates[setter];

                    var steps = path.split(".");

                    var i = 0;
                    var toUpdate = self.container;
                    for (i = 0; i < steps.length - 1; i++) {
                        if (!toUpdate[steps[i]]) {
                            toUpdate[steps[i]] = {};
                        }
                        toUpdate = toUpdate[steps[i]];
                    }

                    toUpdate[steps[steps.length - 1]] = value;
                });
            }

            if (key === '$unset') {
                updates = update.$unset;

                _.keys(updates).forEach(function (setter) {
                    var path = setter;

                    var steps = path.split(".");

                    var i = 0;
                    var toUpdate = self.container;
                    for (i = 0; i < steps.length - 1; i++) {
                        if (!toUpdate[steps[i]]) {
                            toUpdate[steps[i]] = {};
                        }
                        toUpdate = toUpdate[steps[i]];
                    }

                    delete toUpdate[steps[steps.length - 1]];
                });
            }
            if (key === '$merge') {
                updates = update.$merge;

                _.keys(updates).forEach(function (setter) {
                    var path = setter;
                    var value = updates[setter];

                    var steps = path.split(".");

                    var i = 0;
                    var toUpdate = self.container;
                    for (i = 0; i < steps.length; i++) {
                        if (!toUpdate[steps[i]]) {
                            toUpdate[steps[i]] = {};
                        }
                        toUpdate = toUpdate[steps[i]];
                    }

                    _.extend(toUpdate, value);
                });
            }
            if (key === '$push') {
                updates = update.$push;

                _.keys(updates).forEach(function (setter) {
                    var path = setter;
                    var value = updates[setter];

                    if (!_.isArray(value)) {
                        throw new Error("values of $push update must be arrays");
                    }

                    var steps = path.split(".");

                    var i = 0;
                    var toUpdate = self.container;
                    for (i = 0; i < steps.length; i++) {
                        if (!toUpdate[steps[i]]) {
                            if (i === steps.length - 1) {
                                toUpdate[steps[i]] = [];
                            } else {
                                toUpdate[steps[i]] = {};
                            }
                        }
                        toUpdate = toUpdate[steps[i]];
                    }

                    Array.prototype.push.apply(toUpdate, value);
                });
            }
            if (key === '$pull') {
                updates = update.$pull;

                _.keys(updates).forEach(function (setter) {
                    var path = setter;
                    var value = updates[setter];

                    var steps = path.split(".");

                    var i = 0;
                    var toUpdate = self.container;
                    for (i = 0; i < steps.length; i++) {
                        toUpdate = toUpdate[steps[i]];
                    }
                    for (i = 0; i < value.length; i++) {
                        _.pull(toUpdate, value[i]);
                    }
                });
            }
        });
    };

    Store.prototype.toJSON = function () {
        return this.container;
    };

    module.exports = Store;

})();
