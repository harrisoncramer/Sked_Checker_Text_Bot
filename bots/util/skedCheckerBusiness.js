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
    })
};