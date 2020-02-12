const axios = require("axios");
const cheerio = require("cheerio");
const { getRandom } = require("../../util");

module.exports = async () => {
    let proxies = [];
    let res = await axios.get("https://sslproxies.org/");
    if (res.status == 200) {
        const $ = cheerio.load(res.data);
        $("table").first().find("td:nth-child(1)").each(_ => proxies.push({})); // Setup objects.
        $("table").first().find("td:nth-child(1)").each((i, val) => proxies[i].ip = $(val).text()); // Add ips.
        $("table").first().find("td:nth-child(2)").each((i, val) => proxies[i].port = $(val).text()); // Add ports.
        $("table").first().find("td:nth-child(3)").each((i, val) => proxies[i].code = $(val).text()); // Add Codes.

        let proxyIndex = getRandom(0, proxies.length)();
        let proxy = proxies[proxyIndex];
        return proxy;
        
    } else {
        throw new Error("Could not load proxies.", res.message);
    };
};