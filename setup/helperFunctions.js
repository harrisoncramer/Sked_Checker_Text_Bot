String.prototype.replaceAll = function (unwanteds) {
    let str = unwanteds.reduce((agg, x) => {
        y = new RegExp(x, "g");
        agg = agg.replace(y, "");
        return agg;
    }, this);
    return str.trim();
};

String.prototype.replaceAll = function (unwanteds) {
    let str = unwanteds.reduce((agg, x) => {
        y = new RegExp(x, "g");
        agg = agg.replace(y, "");
        return agg;
    }, this);
    return str.trim();
};

const clean = item => item.replace(/\s\s+/g, ' ').trim();
const getLink = node => node.querySelector("a").href;
const getLinkText = node => clean(node.querySelector("a").textContent);

const getNodeFromDocument = query => document.querySelector(query);
const getNextNodeFromDocument = query => document.querySelector(query).nextSibling;
const getTextFromDocument = query => clean(document.querySelector(query).textContent);
const getNextTextFromDocument = query => clean(document.querySelector(query).nextSibling.textContent);
const makeArrayFromDocument = query => Array.from(document.querySelectorAll(query));
const makeCleanArrayFromDocument = query => Array.from(document.querySelectorAll(query)).map(x => clean(x));

const getFromNode = (node, query) => node.querySelector(query);
const getFromText = (node, query) => clean(node.querySelector(query).textContent);
const getFromLink = (node, query) => node.querySelector(query).href;
const getNextMatch = (node, query) => node.querySelector(query).nextSibling.nodeValue

const makeTextArray = (node, query) => Array.from(node.querySelectorAll(query)).map(x => clean(x.textContent));