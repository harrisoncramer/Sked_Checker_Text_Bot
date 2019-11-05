const { asyncForEach } = require("../util");

const checkIfDatumShouldUpdate = ({ params, dbDatum, pageDatum }) => {
    let isDifference = !params.every((param) => pageDatum[param] === dbDatum[param]); // Once a single difference is noticed, will return false (which is then flipped). Otherwise, will return true.
    return isDifference;
};

const checkIfDatumShouldUpdateDeep = ({ params, dbDatum, pageDatum, deep }) => {

    // First, check for updates in normal parameters...
    let normalParams = params.filter(p => p !== deep);
    let isDifference = !normalParams.every(param => pageDatum[param] === dbDatum[param]); // Once a single difference is noticed, will return false (which is then flipped). Otherwise, will return true.
    if(isDifference){
        return true;
    }

    // Then see if the deep list has any changes (will return number of chnages. Zero is falsey value.)
    isDifference = pageDatum[deep].filter(x => !dbDatum[deep].includes(x)).length + dbDatum[deep].filter(x => !pageDatum[deep].includes(x)).length;
    return isDifference;
};

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

        if(deep && Array.isArray(item[0][deep])){ // If deep argument passed, and matching dbItem contains array...
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