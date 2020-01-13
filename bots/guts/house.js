const { getLinksTwo } = require("./index");

module.exports = {
  hfacHearingsAndMarkups: page =>
    page.evaluate(() => {
      let title = getText(".title");
      let date = getText("span.date");
      let time = getText("span.time");
      let location = getNextText("span.location strong").replaceAll(["House Office Building, Washington, DC 20515", " House Office Building"])
      let witnesses = makeArray("div.witnesses strong")
        .map(x => clean(x.textContent))
        .filter(x => x !== "");
      let isSubcommittee = !!getNode("span.subcommittee");
      let subcommittee = isSubcommittee ? getNextText("span.subcommittee strong") : null;
      return { title, date, time, location, witnesses, isSubcommittee, subcommittee };
    }),
  hascBusiness: page =>
    page.evaluate(() => {
      let trs = Array.from(document.querySelectorAll('table tbody tr'));
      let res = trs.reduce(
        (agg, item, i) => {
          const tds = Array.from(item.children);
          tds.forEach(td => {
            let type = td.classList.value.split(' ').pop();
            let val = td.textContent;
            agg[i][type] = val;
            td.childElementCount
              ? (agg[i]['link'] = td.children[0].href)
              : null;
          });

          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  hascWitnesses: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll('div.post-content b'),
      )
        .map(i => clean(i.textContent))
        .slice(1) // Get rid of title...
        .filter(x => !['Witnesses:', '', 'Panel 1:', 'Panel 2:'].includes(x));
      return {witnesses};
    }),
  hvacBusiness: page =>
    page.evaluate(() => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent)
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent.trim();
          let date = item[2].textContent.trim();
          let time = item[3].textContent.trim();
          agg[i] = {link, title, location, time, date};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  hvacWitnesses: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll('section.hearing__agenda b'),
      )
        .map(i => i.textContent.replace(/\s\s+/g, ' ').trim())
        .filter(
          x =>
            ![
              'Witnesses:',
              '',
              'Panel 1',
              'Panel 2',
              'Panel One',
              'Panel Two',
            ].includes(x),
        );
      return {witnesses};
    }),
  hvacMarkup: page =>
    page.evaluate(() => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent)
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent.trim();
          let date = item[2].textContent
            .trim()
            .concat(` at ${item[3].textContent.trim()}`);
          let witnesses = [];
          agg[i] = {link, title, location, date, witnesses};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  hhscWitnesses: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll(
          'section.sectionhead__hearingInfo ul:first-of-type a',
        ),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
      return {witnesses};
    }),
  hhscBusiness: page =>
    page.evaluate(() => {
      let trs = Array.from(
        document.querySelectorAll(
          '#main_column > div.hearings-table tbody tr.vevent',
        ),
      ).map(x => x.querySelectorAll('td > div.faux-col'));
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent.replace("Add to my Calendar", ""))
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent
            .trim()
            .replace(' House Office Building, Washington, DC 20515', '');
          let date = clean(item[2].textContent)
          let time = clean(item[3].textContent)
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hagcWitnessesAndLocation: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll('.thiswillnotbefound'),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
      let location = document.querySelector('.thiswillnotbefound')
        ? document
            .querySelector('.thiswillnotbefound')
            .querySelector('.testing')
            .textContent.replace('House Office Building', '')
        : '';
      return {witnesses, location};
    }),
  hagcBusiness: page =>
    page.evaluate(() => {
      let info = Array.from(
        document.querySelectorAll('ul.calendar-listing li'),
      );
      let res = info.reduce(
        (agg, item, i) => {
          let title = item
            .querySelector('a')
            .textContent.replace(/\s\s+/g, ' ')
            .trim();
          let link = item.querySelector('a').href;
          let date = item
            .querySelector('div.newsie-details span:nth-child(1)')
            .nextSibling.nodeValue.replace(/\s\s+/g, ' ')
            .replace('|', '')
            .trim();
          let time = item
            .querySelector('div.newsie-details span:nth-child(2)')
            .nextSibling.nodeValue.replace(/\s\s+/g, ' ')
            .trim();
          // let location = item[1].textContent.trim().replace(" House Office Building, Washington, DC 20515", "");
          agg[i] = {link, title, date, time};
          return agg;
        },
        Array(info.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hapcBusinessAndMarkup: page =>
    page.evaluate(() => {
      let boxes = Array.from(
        document
          .querySelectorAll('.pane-content')[1]
          .querySelectorAll('.views-row'),
      );
      let res = boxes.reduce(
        (agg, item, i) => {
          let link = item.querySelector('a').href;
          let title = item.querySelector('a').textContent;
          let timeInfo = item
            .querySelector('span.date-display-single')
            .textContent.split('-');
          let date = clean(timeInfo[0])
          let time = clean(timeInfo[1])
          let location = item
            .querySelector('.views-field-field-congress-meeting-location')
            .textContent.replace(
              'House Office Building, Washington, DC 20515',
              '',
            )
            .trim();
          agg[i] = {link, title, date, time, location};
          return agg;
        },
        Array(boxes.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hapcWitnesses: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll(
          '.field-name-field-congress-meeting-witnesses strong',
        ),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
      return {witnesses};
    }),
  hbucBusinessAndMarkup: page =>
    page.evaluate(() => {
      let boxes = Array.from(
        document
          .querySelectorAll('.pane-content')[1]
          .querySelectorAll('.views-row'),
      );

      let res = boxes.reduce(
        (agg, item, i) => {
          let link = item.querySelector('a').href;
          let title = item.querySelector('a').textContent;
          let timeInfo = item
            .querySelector('span.date-display-single')
            .textContent.split('-');
          let date = clean(timeInfo[0])
          let time = clean(timeInfo[1])

          agg[i] = {link, title, date, time};
          return agg;
        },
        Array(boxes.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hbucWitnessesAndLocation: page =>
    page.evaluate(() => {
      let witnesses = Array.from(
        document.querySelectorAll(
          '.field-name-field-congress-meeting-witnesses strong',
        ),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
      let location = document.querySelector(
        '.pane-node-field-congress-meeting-location',
      )
        ? document
            .querySelector('.pane-node-field-congress-meeting-location')
            .querySelector('.field-items')
            .textContent.replace(
              ' House Office Building, Washington, DC 20515',
              '',
            )
        : '';
      return {witnesses, location};
    }),
  helpMarkup: page =>
    page.evaluate(() => {
      // trs = trs ? trs : [];

      let boxes = Array.from(document.querySelectorAll('div.views-row'))
        .map(x => x.querySelectorAll('.views-field'))
        .filter(x => x.length > 0);
      
      let res = boxes.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent)
          let link = item[0].querySelector('a').href;
          let dateInfo = item[1].textContent.split("-");
          let date = dateInfo[0].trim();
          let time = dateInfo[1].trim();
          agg[i] = {link, title, time, date};
          return agg;
        },
        Array(boxes.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  helpBusiness: page =>
    page.evaluate(() => {
      // trs = trs ? trs : [];

      let trs = Array.from(document.querySelectorAll('tr.vevent'))
        .map(x => x.querySelectorAll('td > div.faux-col'))
        .filter(row => row.length > 0);

      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent)
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent
            .replace('House Office Building', '')
            .replace('Washington, D.C.', '')
            .trim();
          let date = item[2].textContent.trim().replace(/\./g, '/');
          agg[i] = {link, title, location, date};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  helpWitnessesAndTime: page =>
    page.evaluate(() => {
      let h2 = document.evaluate(
        "//h2[contains(., 'Witnesses')]",
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );

      let jumpPoint = h2.iterateNext();

      let witnesses = jumpPoint
        ? Array.from(
            jumpPoint.parentElement.nextElementSibling.nextElementSibling.querySelectorAll(
              'span.fn',
            ),
          ).map(item => item.textContent.trim())
        : [];

      let timeSelector = document.querySelector('.time b');

      let time = timeSelector ? timeSelector.nextSibling.textContent : '';

      return {witnesses, time};
    }),
};
