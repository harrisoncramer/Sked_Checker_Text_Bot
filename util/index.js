const randomUser = require('random-useragent');
const axios = require("axios");
const rp = require("request-promise");
const logger = require("../logger");

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

const getRandom = (bottom, top) => {
    return function() {
        return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
    }
};

const requestPromiseRetry = async (url, n, proxies) => {
        
    const userAgentString = randomUser.getRandom();
    let options = { 
        headers: { 'User-Agent': userAgentString },
        // timeout: 3000 // This is not the correct way to set a timeout
    };

    if(proxies){
        let proxyIndex = getRandom(0, proxies.length)();
        let proxyData = proxies[proxyIndex];
        let proxy = `http://${proxyData.ip}:${proxyData.port}`;
        options.proxy = proxy;
    };

    const proxiedRequest = rp.defaults({  ...options });
    
    try {
        let res = await proxiedRequest.get(url);
        // !!proxies && logger.info(`Fetched with proxy ${options.proxy}`);
        return res;
    } catch(err) {
        if (n === 1) {
            logger.error(`Could not fetch ${url}`);
            throw err;  
        };
        !!proxies  && logger.error(`Proxy fail: ${options.proxy} ––> ${url}`);
        return await requestPromiseRetry(url, n - 1, proxies);
    }
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
    },
    getRandom,
    requestPromiseRetry,   
}