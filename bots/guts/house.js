module.exports = {
  hfacBusiness: page =>
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
  hfacWitnesses: page =>
    page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.witnesses > strong'))
        .map(i => i.textContent.replace(/\s\s+/g, ' ').trim())
        .filter(x => x !== '');
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
      return Array.from(document.querySelectorAll('div.post-content b'))
        .map(i => i.textContent.replace(/\s\s+/g, ' ').trim())
        .slice(1) // Get rid of title...
        .filter(x => !['Witnesses:', '', 'Panel 1:', 'Panel 2:'].includes(x));
    }),
  hvacBusiness: page =>
    page.evaluate(() => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
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
      return Array.from(document.querySelectorAll('section.hearing__agenda b'))
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
    }),
  hvacMarkup: page =>
    page.evaluate(() => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
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
      return Array.from(
        document.querySelectorAll(
          'section.sectionhead__hearingInfo ul:first-of-type a',
        ),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
    }),
  hhscBusiness: page =>
    page.evaluate(() => {
      debugger;
      let trs = Array.from(
        document.querySelectorAll(
          '#main_column > div.hearings-table tbody tr.vevent',
        ),
      ).map(x => x.querySelectorAll('td > div.faux-col'));
      let res = trs.reduce(
        (agg, item, i) => {
          let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent
            .trim()
            .replace(' House Office Building, Washington, DC 20515', '');
          let date = item[2].textContent.replace(/\s\s+/g, ' ').trim();
          let time = item[3].textContent.replace(/\s\s+/g, ' ').trim();
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hagcWitnesses: page =>
    page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('.thiswillnotbefound'),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
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
          agg[i] = {link, title, location: '', date, time};
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
        document.querySelector('.pane-content').querySelectorAll('.views-row'),
      );
      let res = boxes.reduce(
        (agg, item, i) => {
          let link = item.querySelector('a').href;
          let title = item.querySelector('a').textContent;
          let timeInfo = item
            .querySelector('span.date-display-single')
            .textContent.split('-');
          let date = timeInfo[0].replace(/\s\s+/g, ' ').trim();
          let time = timeInfo[1].replace(/\s\s+/g, ' ').trim();
          let location = item
            .querySelector('.views-field-field-congress-meeting-location')
            .textContent.replace(/\s\s+/g, ' ')
            .replace(' House Office Building, Washington, DC 20515', '')
            .trim();

          agg[i] = {link, title, location, date, time};
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
      return Array.from(
        document.querySelectorAll(
          '.field-name-field-congress-meeting-witnesses strong',
        ),
      ).map(i => i.textContent.replace(/\s\s+/g, ' ').trim());
    }),
};