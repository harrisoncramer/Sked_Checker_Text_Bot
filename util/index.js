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

const timeoutRequest = (signal, url, proxies) => {
    return new Promise((res, rej) => {
      let userAgentString = randomUser.getRandom();
      let options = {
        headers: {'User-Agent': userAgentString},
      };
  
      if (proxies) {
        let proxyIndex = getRandom(0, proxies.length)();
        let proxyData = proxies[proxyIndex];
        let proxy = `http://${proxyData.ip}:${proxyData.port}`;
        options.proxy = proxy;
      }
  
      let proxiedRequest = rp.defaults({...options});
      proxiedRequest
        .get(url)
        .then(result => res(result))
        .catch(err => {
          !!proxies && logger.error(`Proxy fail: ${options.proxy} ––> ${url}`);
          !proxies && logger.error(`Timeout reached, retrying...`);  
          rej(err)
        });
  
      signal.catch(err => {
        rej(err);
      });
    });
  };
  
  const cancellableSignal = (ms, url) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout after ${ms}ms on ${url}`));
      }, ms);
    });
  };
  
  const requestPromiseRetry = async (url, n, proxies) => {
      try {
        const signal = cancellableSignal(process.env.LATENCY, url);
        let res = await timeoutRequest(signal, url);
        return res;
      } catch (err) {
        if (n === 1) {
          logger.error(`Could not fetch ${url}`);
          throw err;
        } else {
          logger.warn(err.stack);
          return await requestPromiseRetry(url, n-1, proxies);
        }
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
