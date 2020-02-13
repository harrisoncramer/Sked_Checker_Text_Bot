const axios = require("axios");
const cheerio = require("cheerio");
const { getRandom } = require("../../util");
const randomUser = require("random-useragent");
const { setupPuppeteer } = require("../index.js");
const logger = require("../../logger");

module.exports = async () => {

    let res = await axios.get("http://free-proxy.cz/en/proxylist/country/US/http/speed/all", options);  // "https://sslproxies.org/");


    if (res.status == 200) {
        let $ = cheerio.load(res.data);
        let rows = $("table#proxy_list tbody")
            .find("tr")
            .filter((i,v) => i < 20 && v.children.length > 1)
            .map((i,v) => $(v).find("td:nth-child(-n+11)"));

        let proxies = rows.map((i,v) => {
            let ip = v[0].innerText;
            let port = v[1].innerText;
            let protocol = v[2].innerText;
            let country = v[3].innerText;
            let region = v[4].innerText;
            let city = v[5].innerText;
            let anonymity = v[6].innerText;
            let speed = v[7].innerText;
            return { ip, port, protocol, country, region, city, anonymity, speed };
        });

        let proxyIndex = getRandom(0, proxies.length)();
        let proxy = proxies[proxyIndex];
        logger.info(`Proxy successfully connected: ${JSON.stringify(proxy)}`);
        return proxy;
        
    } else {
        throw new Error("Could not load proxies.", res.message);
    };
}