module.exports = {    
    hfacBusiness: page => page.evaluate(() => {
        let trs = Array.from(document.querySelectorAll("table tbody tr"));
        let res = trs.reduce((agg, item, i) => {
            const tds = Array.from(item.children);
            tds.forEach((td) => {
                let type = td.classList.value.split(" ").pop();
                let val = td.textContent;
                agg[i][type] = val;
                td.childElementCount ? agg[i]['link'] = td.children[0].href : null;
            });
            
            return agg;

        }, Array(trs.length).fill().map(_ => ({})));
        return res;
    }),
    hfacWitnesses: page => page.evaluate(() => {
        return Array.from(document.querySelectorAll("div.witnesses > strong"))
            .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()))
            .filter(x => x !== "");
    }),
    hascBusiness: page => page.evaluate(() => {
        let trs = Array.from(document.querySelectorAll("table tbody tr"));
        let res = trs.reduce((agg, item, i) => {
            const tds = Array.from(item.children);
            tds.forEach((td) => {
                let type = td.classList.value.split(" ").pop();
                let val = td.textContent;
                agg[i][type] = val;
                td.childElementCount ? agg[i]['link'] = td.children[0].href : null;
            });
            
            return agg;

        }, Array(trs.length).fill().map(_ => ({})));

        return res;
    }),
    hascWitnesses: page => page.evaluate(() => {
        return Array.from(document.querySelectorAll("div.post-content b"))
            .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()))
            .slice(1) // Get rid of title...
            .filter(x => !["Witnesses:", "", "Panel 1:", "Panel 2:"].includes(x));
    }),
    sascBusiness: page => page.evaluate(() => {
        let trs = Array.from(document.querySelectorAll("table tbody tr.vevent"));
        let res = trs.reduce((agg, item, i) => {
            const tds = Array.from(item.children);
            let link = tds[0].children[0] ? tds[0].children[0].href : 'No Link.';
            let title = tds[0].children[0].textContent.replace(/\s\s+/g, ' ').trim();
            let location = tds[1].children[0] ? tds[1].children[0].textContent.trim() : 'No location.'; 
            let date = tds[2].children[0] ? tds[2].children[0].textContent.trim() : 'No date.';
            agg[i] = { link, title, location, date };
            return agg;
        }, Array(trs.length).fill().map(_ => ({})));

        return res;
    }),
    sascWitnesses: page => page.evaluate(() => {
        return Array.from(document.querySelectorAll("li.vcard span.fn"))
            .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()));
    }),
    sfrcBusiness: page => page.evaluate(() => {
        let divs = Array.from(document.querySelectorAll("div.table-holder > div.text-center"));
        let res = divs.reduce((agg, item, i) => {
            let link = item.children[0] ? item.children[0].href : 'No Link.';
            let title = item.querySelector("h2.title").textContent;
            let location = item.querySelector("span.location") ? item.querySelector("span.location").textContent.replace(/\s\s+/g, ' ').trim() : 'No location.';
            let date = item.querySelector("span.date") ? item.querySelector("span.date").textContent.replace(/\s\s+/g, ' ').trim() : 'No date.';
            agg[i] = { link, title, location, date };
            return agg;
        }, Array(divs.length).fill().map(_ => ({})));

        return res;
    }),
    sfrcWitnesses: page => page.evaluate(() => {
        return Array.from(document.querySelectorAll("span.fn"))
            .map((i => i.textContent.replace(/\s\s+/g, ' ').trim()));
    }),
};