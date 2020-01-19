module.exports = {
  sascLayerOne: page =>
    page.evaluate(_ => {
      let trs = makeArrayFromDocument('table tbody tr.vevent').slice(0, 9);
      let res = trs.reduce(
        (agg, item, i) => {
          const tds = Array.from(item.children);
          let title = clean(tds[0].children[0].textContent);
          let link = getLink(tds[0]);
          let location = tds[1].children[0]
            ? clean(tds[1].children[0].textContent)
            : 'No location.';
          let date = tds[2].children[0]
            ? clean(tds[2].children[0].textContent.split(' ')[0])
            : 'No date.';
          let time = tds[2].children[0]
            ? clean(tds[2].children[0].textContent.split(' ')[1])
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
  sascLayerTwo: page =>
    page.evaluate(_ => {
      let witnesses = makeArrayFromDocument('li.vcard span.fn').map(x =>
        clean(x.textContent),
      );
      return {witnesses};
    }),
  sfrcBusiness: page =>
    page.evaluate(_ => {
      let divs = makeArrayFromDocument('div.table-holder > div.text-center');
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
      let witnesses = makeArrayFromDocument('span.fn').map(i => clean(i.textContent));
      return {witnesses};
    }),
  svacBusiness: page =>
    page.evaluate(_ => {
      let trs = makeArrayFromDocument('tr.vevent')
        .slice(0, 9)
        .map(x => x.querySelectorAll('td > div.faux-col'));
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent);
          let link = item[0].querySelector('a').href;
          let location = clean(item[1].textContent);
          let dateInfo = item[2].textContent.trim().split(' ');
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
      let witnesses = makeArrayFromDocument('span.fn').map(i => clean(i.textContent));
      return {witnesses};
    }),
};
