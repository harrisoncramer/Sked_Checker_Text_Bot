module.exports = {
  sascBusiness: page =>
    page.evaluate(_ => {
      let trs = Array.from(document.querySelectorAll('table tbody tr.vevent'));
      let res = trs.reduce(
        (agg, item, i) => {
          const tds = Array.from(item.children);
          let link = tds[0].children[0] ? tds[0].children[0].href : 'No Link.';
          let title = tds[0].children[0].textContent
            .replace(/\s\s+/g, ' ')
            .trim();
          let location = tds[1].children[0]
            ? tds[1].children[0].textContent.trim()
            : 'No location.';
          let date = tds[2].children[0]
            ? tds[2].children[0].textContent.split(' ')[0].trim()
            : 'No date.';
          let time = tds[2].children[0]
            ? tds[2].children[0].textContent.split(' ')[1].trim()
            : 'No time.';
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  sascWitnesses: page =>
    page.evaluate(_ => {
      let witnesses = Array.from(document.querySelectorAll('li.vcard span.fn')).map(i =>
        i.textContent.replace(/\s\s+/g, ' ').trim(),
      );
      return { witnesses };
    }),
  sfrcBusiness: page =>
    page.evaluate(_ => {
      let divs = Array.from(
        document.querySelectorAll('div.table-holder > div.text-center'),
      );
      let res = divs.reduce(
        (agg, item, i) => {
          let link = item.children[0] ? item.children[0].href : 'No Link.';
          let title = item.querySelector('h2.title').textContent;
          let location = item.querySelector('span.location')
            ? item
                .querySelector('span.location')
                .textContent.replace(/\s\s+/g, ' ')
                .trim()
            : 'No location.';
          let date = item.querySelector('span.date')
            ? item
                .querySelector('span.date')
                .textContent.split('@')[0]
                .replace(/\s\s+/g, ' ')
                .trim()
            : 'No date.';
          let time = item.querySelector('span.date')
            ? item
                .querySelector('span.date')
                .textContent.split('@')[1]
                .replace(/\s\s+/g, ' ')
                .trim()
            : 'No time.';
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(divs.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  sfrcWitnesses: page =>
    page.evaluate(_ => {
      let witnesses = Array.from(document.querySelectorAll('span.fn')).map(i =>
        i.textContent.replace(/\s\s+/g, ' ').trim(),
      );
      return { witnesses };
    }),
  svacBusiness: page =>
    page.evaluate(_ => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = item[0].textContent.replace(/\s\s+/g, ' ').trim();
          let link = item[0].querySelector('a').href;
          let location = item[1].textContent.trim();
          let dateInfo = item[2].textContent.trim().split(" ");
          let date = dateInfo[0];
          let time = dateInfo[1];
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  svacWitnesses: page =>
    page.evaluate(_ => {
      let witnesses = Array.from(document.querySelectorAll('span.fn')).map(i =>
        i.textContent.replace(/\s\s+/g, ' ').trim(),
      );
      return { witnesses };
    }),
};
