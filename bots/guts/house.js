const {getLinksTwo} = require('./index');

module.exports = {
  getLinks: ({page, selectors}) => {
    return page.evaluate(
      ({selectors}) => {
        let {boxSelectors, linkSelectors} = selectors;
        let boxes = makeArrayFromDocument(boxSelectors);
        let links = boxes.map(x => x.querySelector(linkSelectors).href);
        let data = links.slice(0, 9).map(link => ({link}));
        return data;
      },
      {selectors},
    );
  },
  hfacLayerTwo: page =>
    page.evaluate(_ => {
      let title = getTextFromDocument('.title');
      let date = getTextFromDocument('span.date');
      let time = getTextFromDocument('span.time');
      let location = getNextTextFromDocument('span.location strong').replaceAll([
        'House Office Building, Washington, DC 20515',
        ' House Office Building',
      ]);
      let witnesses = makeArrayFromDocument('div.witnesses strong')
        .map(x => clean(x.textContent))
        .filter(x => x !== '');
      let isSubcommittee = !!getNodeFromDocument('span.subcommittee');
      let subcommittee = isSubcommittee
        ? getNextTextFromDocument('span.subcommittee strong')
        : null;
      return {
        title,
        date,
        time,
        location,
        witnesses,
        isSubcommittee,
        subcommittee,
      };
    }),
  hascLayerOne: page => {
    return page.evaluate(_ => {
      let boxes = makeArrayFromDocument('table tbody tr');
      let data = boxes.map(box => {
        let link = getLink(box);
        let title = getLinkText(box);
        let x = new RegExp('Subcommittee', 'i');
        let isSubcommittee = !!title.match(x);
        let subcommittee = isSubcommittee ? title.split(':')[0] : null;
        title = title.replaceAll([subcommittee, ':']).trim();
        return {link, title, subcommittee, isSubcommittee};
      });
      return data;
    });
  },
  hascLayerTwo: page =>
    page.evaluate(_ => {
      let pageData = getTextFromDocument('div.post-content')
        .split('(')[1]
        .split(')')[0]
        .split('–');
      let time = pageData[0].trim();
      let location = pageData[1].trim();
      let witnesses = makeArrayFromDocument('div.post-content b')
        .map(i => clean(i.textContent))
        .slice(1) // Get rid of title...
        .filter(x => !['Witnesses:', '', 'Panel 1:', 'Panel 2:'].includes(x));
      return {time, location, witnesses};
    }),
  hvacBusiness: page =>
    page.evaluate(_ => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent);
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
    page.evaluate(_ => {
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
    page.evaluate(_ => {
      let trs = Array.from(document.querySelectorAll('tr.vevent')).map(x =>
        x.querySelectorAll('td > div.faux-col'),
      );
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent);
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
  hhscBusiness: page =>
    page.evaluate(_ => {
      let trs = makeArrayFromDocument('#main_column > div.hearings-table tbody tr.vevent')
        .slice(0, 9)
        .map(x => x.querySelectorAll('td > div.faux-col'));
      let res = trs.reduce(
        (agg, item, i) => {
          let title = clean(
            item[0].textContent.replace('Add to my Calendar', ''),
          );
          let link = getLink(item[0]);
          let location = item[1].textContent
            .trim()
            .replace(' House Office Building, Washington, DC 20515', '');
          let date = clean(item[2].textContent);
          let time = clean(item[3].textContent);
          agg[i] = {link, title, location, date, time};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );
      return res;
    }),
  hhscWitnesses: page =>
    page.evaluate(_ => {
      let witnesses = makeArrayFromDocument(
        'section.sectionhead__hearingInfo ul:first-of-type a',
      ).map(i => clean(i.textContent));
      return {witnesses};
    }),
  hagcWitnessesAndLocation: page =>
    page.evaluate(_ => {
      let witnesses = makeArrayFromDocument('.thiswillnotbefound').map(i =>
        clean(i.textContent),
      );
      let location = getNodeFromDocument('.thiswillnotbefound')
        ? getTextFromDocument('.thiswillnotbefound .testing').replace(
            'House Office Building',
            '',
          )
        : '';
      return {witnesses, location};
    }),
  hagcBusiness: page =>
    page.evaluate(_ => {
      let info = makeArrayFromDocument('ul.calendar-listing li').slice(0, 9);
      let res = info.reduce(
        (agg, item, i) => {
          let title = clean(getLinkText(item));
          let link = getLink(item);
          let date = clean(
            getNextMatch(item, 'div.newsie-details span:nth-child(1)'),
          ).replace('|', '');
          let time = clean(
            getNextMatch(item, 'div.newsie-details span:nth-child(2)'),
          );
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
    page.evaluate(_ => {
      let boxes = Array.from(
        document
          .querySelectorAll('.pane-content')[1]
          .querySelectorAll('.views-row'),
      ).slice(0, 9);
      let res = boxes.reduce(
        (agg, item, i) => {
          let link = getLink(item);
          let title = getLinkText(item);
          let timeInfo = item
            .querySelector('span.date-display-single')
            .textContent.split('-');
          let date = clean(timeInfo[0]);
          let time = clean(timeInfo[1]);
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
    page.evaluate(_ => {
      let witnesses = makeArrayFromDocument('.thiswillnotbefound').map(x =>
        clean(x.textContent),
      );
      return {witnesses};
    }),
  hbucBusinessAndMarkup: page =>
    page.evaluate(_ => {
      let boxes = Array.from(
        document
          .querySelectorAll('.pane-content')[1]
          .querySelectorAll('.views-row'),
      ).slice(0, 9);

      let res = boxes.reduce(
        (agg, item, i) => {
          let link = getLink(item);
          let title = getLinkText(item);
          let timeInfo = item
            .querySelector('span.date-display-single')
            .textContent.split('-');
          let date = clean(timeInfo[0]);
          let time = clean(timeInfo[1]);

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
    page.evaluate(_ => {
      let witnesses = makeArrayFromDocument(
        '.field-name-field-congress-meeting-witnesses strong',
      ).map(i => clean(i.textContent));
      let location = getNodeFromDocument('.pane-node-field-congress-meeting-location')
        ? getTextFromDocument(
            '.pane-node-field-congress-meeting-location .field-items',
          ).replace(' House Office Building, Washington, DC 20515', '')
        : '';
      return {witnesses, location};
    }),
  helpMarkup: page =>
    page.evaluate(_ => {
      let boxes = makeArrayFromDocument('div.views-row')
        .map(x => x.querySelectorAll('.views-field'))
        .slice(0, 9)
        .filter(x => x.length > 0);

      let res = boxes.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent);
          let link = getLink(item[0]);
          let dateInfo = item[1].textContent.split('-');
          let date = dateInfo[0].trim();
          let time = dateInfo[1].trim();
          let witnesses = [];
          agg[i] = {link, title, time, date, witnesses};
          return agg;
        },
        Array(boxes.length)
          .fill()
          .map(_ => ({})),
      );

      return res;
    }),
  helpBusiness: page =>
    page.evaluate(_ => {
      let trs = makeArrayFromDocument('tr.vevent')
        .slice(0, 9)
        .map(x => x.querySelectorAll('td > div.faux-col'))
        .filter(row => row.length > 0);

      let data = trs.reduce(
        (agg, item, i) => {
          let title = clean(item[0].textContent);
          let link = getLink(item[0]);
          let location = item[1].textContent.replaceAll([
            'House Office Building',
            'Washington, D.C.',
          ]);
          let date = clean(item[2].textContent).replace(/\./g, '/');
          agg[i] = {link, title, location, date};
          return agg;
        },
        Array(trs.length)
          .fill()
          .map(_ => ({})),
      );

      return data;
    }),
  helpWitnessesAndTime: page =>
    page.evaluate(_ => {
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

      let timeSelector = getNodeFromDocument('.time b');

      let time = timeSelector ? timeSelector.nextSibling.textContent : '';

      return {witnesses, time};
    }),
    energyBusiness: page =>
      page.evaluate(_ => {
        let boxes = makeArrayFromDocument("div.views-row");
        let data = boxes.reduce(
          (agg, item, i) => {
            let title = getFromText(item, ".views-field-title").replaceAll(["Hearing on", '"']);
            let link = getLink(item);
            let timeInfo = getFromText(item, "span.date-display-single").split("-");
            let date = clean(timeInfo[0]);
            let time = clean(timeInfo[1]);
            let location = getFromText(item, ".views-field-field-congress-meeting-location").replaceAll([
              'House Office Building',
              'Washington, D.C.',
            ]);
            agg[i] = {link, title, location, date, time};
            return agg;
          },
          Array(boxes.length)
            .fill()
            .map(_ => ({})),
        );
        return data;
      }),
    energyWitnesses: page =>
      page.evaluate(_ => {
        let witnessTag = document.evaluate(
          "//strong[contains(., 'Witnesses')]",
          document,
          null,
          XPathResult.ANY_TYPE,
          null,
        );
  
        let jumpPoint = witnessTag.iterateNext();
        let parent = jumpPoint.parentElement.parentElement;
        let witnesses = makeTextArray(parent, "em");
        return { witnesses };
      }),
    energyMarkup: page =>
      page.evaluate(_ => {
        let witnesses = [];
        return { witnesses };
      }),
    financialServicesBusiness: page =>
      page.evaluate(_ => {
        debugger;
        let witnesses = []
        return { witnesses };
      }),
    financialServicesWitnesses: page =>
      page.evaluate(_ => {
        let witnesses = []
        return { witnesses };
      }),
};
