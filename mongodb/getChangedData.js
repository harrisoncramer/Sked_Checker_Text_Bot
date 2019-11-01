const { asyncForEach } = require("../util");
const checkIfDatumShouldUpdate = require("./sub/checkIfDatumShouldUpdate");
const checkIfDatumShouldUpdateDeep = require("./sub/checkIfDatumShouldUpdateDeep");

module.exports = async ({ existingData, model, comparer, params }, deep) => {
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

        if(deep && item[0][deep]){ // If deep argument passed, and matching dbItem contains array...
            var shouldUpdate = checkIfDatumShouldUpdateDeep({ dbDatum: item[0], pageDatum: datum, params, deep });
        } else {
            var shouldUpdate = checkIfDatumShouldUpdate({ dbDatum: item[0], pageDatum: datum, params }); // Check to see if times have changed...
        }
        if(shouldUpdate){ // If should update is either 1 or 2...
            res.push({ new: datum, old: item[0] });
        };
    });

    return res;
};