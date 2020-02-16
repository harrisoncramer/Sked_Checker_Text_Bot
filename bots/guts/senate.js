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
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td > div.faux-col"));
    $trs.each((i,v) => {
      let linkRef = $(v[0]).find("a").attr("href").trim();
      let link = "https://www.appropriations.senate.gov".concat(linkRef);
      let title = $(v[0]).find("a span")[0].nextSibling.data.trim();
      let location = $(v[1]).text().replace("Senate Office Building", "").trim();
      let timeData = $(v[2]).text().trim().split(" ");
      let date = timeData[0];
      let time = timeData[1];
      res.push({ link, title, time, date, location })
    });
    return res;
  },
  sbnkBusiness: $ => {
    let res = [];
    let $objects = $("div.upcoming-hearings div.centered");
    $objects.each((i,v) => {
      let linkRef = $(v).find("a.summary").attr("href");
      let link = "https://www.banking.senate.gov/hearings".concat(linkRef);
      let title = $(v).find("div.hearing-title").text().trim();
      let location = $(v).find("div.location").text().replace(" Senate Office Building", "").trim();
      let timeData = $(v).find("div.date").text().split("@");
      let date = timeData[0].trim();
      let time = timeData[1].trim();
      res.push({ link, title, location, date, time });
    })
    return res;
  },
  sbdgBusiness: $ => {
    let res = [];
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td > div.faux-col"));
    $trs.each((i,v) => {
      let linkRef = $(v[0]).find("a").attr("href").trim();
      let link = "https://www.budget.senate.gov".concat(linkRef);
      let title = $(v[0]).find("a").text().trim(); 
      let location = $(v).find("span.location").text().split(" ")[0]
      let date = $(v[2]).text().trim();
      res.push({ link, title, date, location });
    });
    return res;
  },
  sbdgWitnesses: $ => {
    let time = $("span.time b")[0].nextSibling.data.trim(); 
    return { time };
  },
  snatBusiness: $ => {
    let res = [];
    let $trs = $("table.recordList").first().find("tr").filter((i,v) => i > 0);
    $trs.each((i,v) => {
      let date = $(v).find("td.recordListDate").text();
      let time = $(v).find("td.recordListTime").text();
      let title = $(v).find("td.recordListTitle").text();
      let link = $(v).find("td.recordListTitle a").attr("href");
      res.push({ date, time, title, link })
    })
    return res;
  },
  snatWitnesses: $ => {
    let roomNumber = $("span.room-number").text();
    let location = $("span.location").text().trim();
    if(roomNumber !== ""){
      location = roomNumber.concat(` ${location}`).replace("Senate Office Building", "").trim();
    };
    return { location }
  },
  senvBusiness: $ => {
    let res = [];
    let $trs = $("div.recordsContainer table.recordList").first().find("tr");
    $trs.each((i,v) => {
      if(i === 0)
        return;
    });
    debugger;
    return res;
  },
  sfinBusiness: $ => {
    let res = [];
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td > div.faux-col"));
    $trs.each((i,v) => {
      let linkRef = $(v[0]).find("a").attr("href").trim();
      let link = "https://www.finance.senate.gov".concat(linkRef);
      let title = $(v[0]).find("a").text().trim();
      let date = $(v[2]).text().trim();
      if(title.includes("The President’s Fiscal"))
        title = title.concat(` (on ${date})`);
      res.push({ link, title, date, });
    });
    return res;
  },
  sfinWitnesses: $ => {
    let time = $("span.time b")[0].nextSibling.data.trim();
    let location = $("span.location b")[0].nextSibling.data.trim();
    var witnesses = $("hr").last().nextAll().find("span.fn").map((i,v) => $(v).text().replace(/\s\s+/g, ' ').trim()).toArray();
    return { time, location, witnesses }
  },
  shlpBusiness: $ => {
    let res = [];
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td > div.faux-col"));
    $trs.each((i,v) => {
      let linkRef = $(v[0]).find("a").attr("href").trim();
      let link = "https://www.help.senate.gov/".concat(linkRef)
      let simpleTitle = $(v[0]).find("span.type")[0].nextSibling.data.trim();
      let location = $(v).find("span.location").text().replace("Senate Office Building", "").trim();
      let timeData = $(v).find("time").text().split(" ");
      let date = timeData[0].trim();
      let time = timeData[1].trim();
      let title;
      if(simpleTitle === "Nominations") {
        title = $(v).find("span.type").parent().text().replace("Executive Session:", "Exec Sess:").replace("Full Committee Hearing:", "Full Cmmte:").replace(/\s\s+/g, " ").concat(` (on ${date})`).trim();
      } else {
        title = $(v).find("span.type").parent().text().replace("Executive Session:", "Exec Sess:").replace("Full Committee Hearing:", "Full Cmmte:").replace(/\s\s+/g, " ").trim();
      }
      res.push({ link, title, location, time, date });
    });
    return res;
  },
  shlpWitnesses: $ => {
    let witnesses = $("span.fn").map((i,v) => $(v).text().replace(/\s\s+/g, " ").trim()).toArray();
    return { witnesses }
  },
  shscBusiness: $ => {
    let res = [];
    let $trs = $("tr.vevent").slice(0,9).map((i,v) => $(v).find("td"));
    $trs.each((i,v) => {
      let link = $(v).find("a").attr("href");
      let title = $(v).find("a").text().trim();
      let timeData = $(v).find("time").text().split(" ");
      let date = timeData[0];
      let time = timeData[1];
      let location = $(v).find(".location").text().replace("Senate Dirksen Building", "Dirksen").replace(", Dirksen Senate Office Building", " Dirksen").replace(/\s\s+/g, " ").trim();
      if(title.includes("Business Meeting"))
        title = title.concat(` on (${date})`).replace(/\s\s+/g, " ").trim();
      res.push({ time, date, title, link, location })
    });
    return res;
  },
  shscWitnesses: $ => {
    let witnesses = $("h1:contains('Witnesses')").next("ul.people").find("span.fn").map((i,v) => $(v).text().replace(/\s\s+/g, " ").trim()).toArray();
    return { witnesses };
  },
  sindBusiness: $ => {
    let res = [];
    let $trs = $("div.view-hearing-views tbody tr").slice(0,9);
    $trs.each((i,v) => {
      let linkRef = $(v).find("a").attr("href");
      let link = "https://www.indian.senate.gov".concat(linkRef);
      let title = $(v).find("a").text().trim();
      let date = $(v).find("span.date-display-single").first().text().trim();
      let time = $(v).find("span.date-display-single").last().text().trim();
      let location = $(v).find("td.views-field-field-hearing-new-office").text().trim().replace("Dirksen-628", "628 Dirsken")
      res.push({ link, title, date, time, location });
    });
    return res;
  },
  sindWitnesses: $ => {
    let witnesses = $("div.field-name-field-hearing-new-witness").find("div.group-header").map((i,v) => $(v).text().trim()).toArray();
    return { witnesses }
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
