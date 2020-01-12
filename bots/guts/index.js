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
  getLinks: ({ page, selectors }) => {
    return page.evaluate((selectors) => {
      let { boxSelectors, linkSelectors } = selectors;
      let boxes = Array.from(document.querySelectorAll(boxSelectors));
      let links = boxes.map(x => x.querySelector(linkSelectors).href);
      return { links: links.slice(0,9) }; // Assume there won't be more than 10 links to process..
    }, selectors)
  }
};
