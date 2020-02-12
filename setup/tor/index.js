const torAxios = require("tor-axios");
const { getRandom } = require("../../util");
const cheerio = require("cheerio");
const randomUser = require('random-useragent');
const getProxy = require("../proxies");

module.exports = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    let ports = process.env.TOR_PORTS.split(" "); // Enable Tor ports in .env file as string, separated by spaces...
    let portIndex = getRandom(0, ports.length - 1)();
    let port = isProduction ? ports[portIndex] : '9050';
    const tor = torAxios.torSetup({
        ip: "localhost",
        port
    });

    let userAgent = randomUser.getRandom();
    let proxySettings = await getProxy();
    let torOptions = {
        headers: {
            'User-Agent': userAgent,
        },
        proxy: {
            host: proxySettings.ip,
            port: proxySettings.port
        }
    };

    let response = await tor.get('https://check.torproject.org/', torOptions);
    let info = response.data;
    const $ = cheerio.load(info);
    let isTor = $("h1").text().includes("Congratulations");
    if(!isTor){
        logger.error(`Axios is not using Tor. Exiting...`)
        return false;
    };


    return { tor, torOptions };    
};