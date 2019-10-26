const { asyncForEach } = require("../util");
const checkIfDatumShouldUpdate = require("./sub/checkIfDatumShouldUpdate");

module.exports = async ({ existingData, model, comparer }) => {
    let res = [];
    await asyncForEach(existingData, async (datum) => {
        
        // Gather all elements that match existingDatum, based on function arguments...
        let title = datum[comparer];
        let item = await model.aggregate([
            {
                $match: {
                    [comparer]: title
                }
            }
        ]);

        let shouldUpdate = checkIfDatumShouldUpdate({ dbDatum: item[0], pageDatum: datum, params: ['recordListTime', 'recordListDate' ]}); // Check to see if times have changed...
        if(shouldUpdate){
            res.push({ new: datum, old: item[0] });
        };
    });

    return res;
};