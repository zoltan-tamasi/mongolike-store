var expect = require('chai').expect;

var Store = require('..');

describe('Store', function() {

    it('should create new Store', function () {

        var store = new Store();

        expect(typeof store).to.equal("object");
    });

    it('should hold a simple value', function () {

        var store = new Store();

        store.fill({
            "key" : "value"
        });

        expect(store.findById("key").get()).to.equal("value");
    });

    it('should hold several key-value pairs', function () {

        var store = new Store();

        store.fill([{
            _id : 1,
            value : "_id: 1"
        }, {
            _id : 2,
            value : "_id: 2"
        }]);

        expect(store.findById(2).get().value).to.equal("_id: 2");
    });

    it('find should work', function () {

        var store = new Store();

        store.fill([{
            _id : 1,
            value : "_id: 1"
        }, {
            _id : 2,
            value : "_id: 2"
        }]);

        expect(store.find(function (object) {
            return object.value === "_id: 2";
        }).get().value).to.equal("_id: 2");
    });

    it('map should work', function () {

        var store = new Store();

        store.fill([{
            _id : 1,
            value : "_id: 1"
        }, {
            _id : 2,
            value : "_id: 2"
        }]);

        var mapped = store.map(function (object) {
            return object.value;
        });

        expect(mapped[1]).to.equal("_id: 2");
    });

    it('applyUpdate: $set should work', function () {

        var store = new Store();

        var update = {
            $set : {
                "1" : "_id: 1"
            }
        };

        store.applyUpdate(update);

        expect(store.findById(1).get()).to.equal("_id: 1");
    });

    it('applyUpdate: $unset should work', function () {

        var store = new Store();

        var update1 = {
            $set : {
                "1" : "_id: 1"
            }
        };

        var update2 = {
            $unset : {
                "1" : null
            }
        };

        store.applyUpdate(update1);
        store.applyUpdate(update2);

        expect(store.findById(1).isNull()).to.equal(true);
    });

    it('applyUpdate: $merge should work', function () {

        var store = new Store();

        var update1 = {
            $set : {
                "1" : {
                    value1 : "value1"
                }
            }
        };

        var update2 = {
            $merge : {
                "1" : {
                    value2 : "value2"
                }
            }
        };

        store.applyUpdate(update1);
        store.applyUpdate(update2);

        expect(store.findById(1).get()).to.deep.equal({
            value1 : "value1",
            value2 : "value2"
        });
    });

    it('applyUpdate: $push should work', function () {

        var store = new Store();

        var update1 = {
            $set : {
                "1" : {
                    value1 : ["value1"]
                }
            }
        };

        var update2 = {
            $push : {
                "1.value1" : ["value2"]
            }
        };

        store.applyUpdate(update1);
        store.applyUpdate(update2);

        expect(store.findById(1).get().value1).to.deep.equal(["value1", "value2"]);
    });

    it('applyUpdate: $pull should work', function () {

        var store = new Store();

        var update1 = {
            $set : {
                "1" : {
                    value1 : ["value1", "value2"]
                }
            }
        };

        var update2 = {
            $pull : {
                "1.value1" : ["value2"]
            }
        };

        store.applyUpdate(update1);
        store.applyUpdate(update2);

        expect(store.findById(1).get().value1).to.deep.equal(["value1"]);
    });
});
