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


const getNodeFromDocument = query => document.querySelector(query);
const getNextNodeFromDocument = query => document.querySelector(query).nextSibling;
const getTextFromDocument = query => document.querySelector(query).textContent.trim();
const getNextTextFromDocument = query => document.querySelector(query).nextSibling.textContent
const makeArrayFromDocument = query => Array.from(document.querySelectorAll(query));
const makeCleanArrayFromDocument = query => Array.from(document.querySelectorAll(query)).map(x => clean(x));

const getFromNode = (node, query) => node.querySelector(query);
const getFromText = (node, query) => node.querySelector(query).textContent;
const getFromLink = (node, query) => node.querySelector(query).href;
const getNextMatch = (node, query) => node.querySelector(query).nextSibling.nodeValue

const makeTextArray = (node, query) => Array.from(node.querySelectorAll(query)).map(x => clean(x.textContent));

const getLink = node => node.querySelector("a").href;
const getLinkText = node => node.querySelector("a").textContent;
const clean = item => item.replace(/\s\s+/g, ' ').trim();



// const getNodeFromDocument = query => document.querySelector(query);
// const  = query => document.querySelector(query).nextSibling;
// const getTextFromDocumentFromDocument = query => document.querySelector(query).textContent.trim();
// const getNextTextFromDocumentFromDocument = query => document.querySelector(query).nextSibling.textContent
// const makeArrayFromDocumentFromDocument = query => Array.from(document.querySelectorAll(query));
// const makeTextArrayFromDocument = query => Array.from(document.querySelectorAll(query)).map(x => clean(x.textContent));

// const getNodeFromDocument = (node, query) => node.querySelector(query);
// const getTextFromDocument = (node, query) => node.querySelector(query).textContent;
// const getLink = (node, query) => node.querySelector(query).href;
// const getNextSiblingValue = (node, query) => node.querySelector(query).nextSibling.nodeValue
// const makeArrayFromDocument = (node, query) => Array.from(node.querySelectorAll(query));
// const makeTextArray = (node, query) => Array.from(node.querySelectorAll(query)).map(x => clean(x.textContent));

// const getLink = node => node.querySelector("a").href;
// const getLinkText = node => node.querySelector("a").textContent;

// const clean = item => item.replace(/\s\s+/g, ' ').trim();