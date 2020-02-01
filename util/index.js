Array.prototype.flatten = function() {
    var ret = [];
    for(var i = 0; i < this.length; i++) {
        if(Array.isArray(this[i])) {
            ret = ret.concat(this[i].flatten());
        } else {
            ret.push(this[i]);
        }
    }
    return ret;
};

module.exports = {
    asyncForEach: async(array, callback) => {
        let results = [];
        for (let index = 0; index < array.length; index++) {
            let result = await callback(array[index]);
            results.push(result);
        }
        return results;
    },
    handleEachJob: async({ layerOneData, browser }, callback) => {
        let results = [];
        for (let index = 0; index < layerOneData.length; index++) {
            let result = await callback({job: layerOneData[index], browser });
            results.push(result);
        }
        return results;
    }
}