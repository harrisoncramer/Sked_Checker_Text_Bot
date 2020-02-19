const randomUser = require('random-useragent');
const axios = require("axios");
const rp = require("request-promise");
const logger = require("../logger")(module);

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

const timeoutRequest = (signal, url, options) => {
    return new Promise((res, rej) => {
  
      let proxiedRequest = rp.defaults({...options});
      proxiedRequest
        .get(url)
        .then(result => res(result))
        .catch(err => rej(err));
  
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
  
  const requestPromiseRetry = async (url, n, proxies, jobName) => {

      jobName = jobName ? jobName : 'proxyFetch';
      let proxy = null;
      let proxyIndex = null;
      let userAgentString = randomUser.getRandom();
      let options = {
        headers: {'User-Agent': userAgentString},
      };

      if (!!proxies) {
        proxyIndex = getRandom(0, proxies.length -1)();
        let proxyData = proxies[proxyIndex];
        proxy = `http://${proxyData.ip}:${proxyData.port}`;
        options.proxy = proxy;

        proxies = proxies.filter((v,i) => i !== proxyIndex); // Remove proxy...
      };
    
      try {
        const signal = cancellableSignal(process.env.LATENCY, url);
        let res = await timeoutRequest(signal, url, options);
        return res;
      } catch (err) {
        if (n === 1 || proxies.length === 0) {
          throw err;
        } else {
          logger.warn(`${jobName} > ${err.message}`) 
          logger.warn(`${jobName} > retrying ${url}...`);
          return await requestPromiseRetry(url, n-1, proxies, jobName);
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
