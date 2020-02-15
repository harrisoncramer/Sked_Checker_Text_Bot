module.exports = {
  sascLayerOne: $ => {
    let res = [];
    let $rows = $("tr.vevent").slice(0, 9).map((i,v) => $(v).find("td"));
    $rows.each((i,v) => {
      let link = $(v[0]).find("a").attr("href");
      let title = $(v[0]).find("a").first().text().trim();
      let location = $(v[1]).text().trim();
      let timeData = $(v[2]).text().trim().split(" ");
      let date = timeData[0];
      let time = timeData[1];
      res.push({ link, title, location, time, date });
    });
    return res;
  },
  sascLayerTwo: $ => {
    var witnesses = $("span.fn").map((i,v) => $(v).text().trim()).toArray();
    return { witnesses };
  },
  sagcBusiness: $ => {
    let res = [];
    let $rows = $("tr.vevent").slice(0, 9).map((i,v) => $(v).find("td > div.faux-col"));
    $rows.each((i,v) => {
      let linkString = $(v[0]).find("a").attr("href");
      let link = 'https://www.agriculture.senate.gov/'.concat(linkString);
      let title = $(v[0]).text().trim();
      let location = $(v[2]).text().trim();
      let timeData = $(v[3]).text().trim().split(" ");
      let date = timeData[0];
      let time = timeData[1];
      res.push({ link, title, location, time, date });
    });
    return res;
  },
  sfrcBusiness: $ => {
    let res = [];
    let $divs = $("div.table-holder > div.text-center");
    $divs.each((i,v) => {
      debugger;
      // MUST WRITE IT WITH ANOTHER
      // HEARING ON THE BOOKS TO FIGURE OUT
      // PROPER METHOD TO SCRAPE THE DATA
      // let linkString = $(v[0]).find("a").attr("href");
      // let link = 'https://www.agriculture.senate.gov/'.concat(linkString);
      // let title = $(v[0]).text().trim();
      // let location = $(v[2]).text().trim();
      // let timeData = $(v[3]).text().trim().split(" ");
      // let date = timeData[0];
      // let time = timeData[1];
      // res.push({ link, title, location, time, date });
    });
    return res;
      // let divs = makeArrayFromDocument('div.table-holder > div.text-center');
      // let res = divs.reduce(
      //   (agg, item, i) => {
      //     let link = item.children[0] ? item.children[0].href : 'No Link.';
      //     let title = item.querySelector('h2.title').textContent;
      //     let location = item.querySelector('span.location')
      //       ? item
      //           .querySelector('span.location')
      //           .textContent.replace(/\s\s+/g, ' ')
      //           .trim()
      //       : 'No location.';
      //     let date = item.querySelector('span.date')
      //       ? item
      //           .querySelector('span.date')
      //           .textContent.split('@')[0]
      //           .replace(/\s\s+/g, ' ')
      //           .trim()
      //       : 'No date.';
      //     let time = item.querySelector('span.date')
      //       ? item
      //           .querySelector('span.date')
      //           .textContent.split('@')[1]
      //           .replace(/\s\s+/g, ' ')
      //           .trim()
      //       : 'No time.';
      //     agg[i] = {link, title, location, date, time};
      //     return agg;
      //   },
      //   Array(divs.length)
      //     .fill()
      //     .map(_ => ({})),
      // );
    },
  sfrcWitnesses: $ => {
    return { witnesses: [] }
  },
  //  page.evaluate(_ => {
  //  let witnesses = makeArrayFromDocument('span.fn').map(i => clean(i.textContent));
  //   return {witnesses};
  // }),
  svacBusiness: $ => {
    let res = [];
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td > div.faux-col"));
    $trs.each((i,v) => {
      let link = $(v[0]).find("a").attr("href").trim();
      let title = $(v[0]).find("a").first().text().trim();
      let timeData = $(v[2]).text().trim().split(" ");
      let time = timeData[1];
      let date = timeData[0];
      if(["Pending Legislation", "Pending Nominations", "Pending Legislation and Nomination", "Pending Legislation and Nominations"].includes(title)){
        title = title.concat(` (on ${date})`);
      }
      let location = $(v[1]).text().trim().replace("Senate Office Building ", "");
      res.push({ link, title, time, date, location });
    });
    return res;
  },
  svacWitnesses: $ => {
    let witnesses = $("span.fn").map((v,i) => $(i).text().trim()).toArray();
    return { witnesses };
  },
  sagcWitnesses: $ => [],
  sapcBusiness: $ => {
    let res = [];
    return res;
  },
  sbnkBusiness: $ => {
    let res = [];
    return res;
  },
  sbdgBusiness: $ => {
    let res = [];
    return res;
  },
  snatBusiness: $ => {
    let res = [];
    return res;
  },
  senvBusiness: $ => {
    let res = [];
    return res;
  },
  sfinBusiness: $ => {
    let res = [];
    return res;
  },
  shlpBusiness: $ => {
    let res = [];
    return res;
  },
  shscBusiness: $ => {
    let res = [];
    return res;
  },
  sindBusiness: $ => {
    let res = [];
    return res;
  },
  sfinBusiness: $ => {
    let res = [];
    return res;
  },
  sjudBusiness: $ => {
    let res = [];
    return res;
  },
  srleBusiness: $ => {
    let res = [];
    return res;
  },
  sethBusiness: $ => {
    let res = [];
    return res;
  },
  svetBusiness: $ => {
    let res = [];
    return res;
  },
  ssciBusiness: $ => {
    let res = [];
    return res;
  },
  ssbsBusiness: $ => {
    let res = [];
    return res;
  },
  sstrBusiness: $ => {
    let res = [];
    return res;
  },
};
