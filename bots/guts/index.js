const moment = require("moment");

module.exports = {
  sortPageData: ({pageData, dbData, comparer}) => {
    let dbTitles = dbData.map(x => x[comparer]);
    let existingData = [];
    let newData = pageData.filter(x => {
      let pageTitle = x[comparer]; // Get title of doc.
      let i = dbTitles.indexOf(pageTitle);
      if (i === -1) {
        // If it's new...
        return true;
      }
      existingData.push(x);
      return false;
    });

    return {existingData, newData};
  },
  getLinks: ({page, selectors}) => {
    return page.evaluate(
      ({selectors}) => {
        let {boxSelectors, linkSelectors} = selectors;
        let boxes = Array.from(document.querySelectorAll(boxSelectors));
        let links = boxes.map(x => x.querySelector(linkSelectors).href);
        return {links: links.slice(0, 9)}; // Assume there won't be more than 10 links to process..
      },
      {selectors},
    );
  },
  cleanupData: (data) => {
    data.map(x => { 
      let cleanedDate = moment(x.date).format("MMMM DD");
      let cleanedTime = moment(x.time).format("LT");
      let date = cleanedDate !== "Invalid date" ? cleanedDate : x.date;
      let time = cleanedTime !== "Invalid date" ? cleanedTime : x.time;
      return { ...x, date, time };
    });
    return data;
  }
};
