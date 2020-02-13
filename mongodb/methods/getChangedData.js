const { asyncForEach } = require("../../util");

const checkIfDatumShouldUpdateShallow = ({ params, dbDatum, pageDatum, deep }) => { 
    let normalParams = params.filter(p => p !== deep);
    let shallowChanges = normalParams.filter(param => pageDatum[param] !== dbDatum[param])
    if(shallowChanges.length > 0){
        var changes = shallowChanges.map(param => `${param} > ${dbDatum[param]} ––> ${pageDatum[param]}`);
    };
    return changes;
};

const checkIfDatumShouldUpdateDeep = ({ dbDatum, pageDatum, deep }) => {
    if(!pageDatum[deep])
        return null
    let newDeepItems = pageDatum[deep].filter(x => !dbDatum[deep].includes(x)); // Return all pageData that isn't included in the dbData.
    let deletedDeepItems = dbDatum[deep].filter(x => !pageDatum[deep].includes(x)); // Return all dbData that isn't included in the pageData.
    if(newDeepItems.concat(deletedDeepItems).length > 0){ // If any changes...
        var deepChanges = newDeepItems.reduce((agg, x, i) => { 
                !!i ? agg = agg.concat(`${x}, `) : agg.concat(`${x} || `);
                return newDeepItems.length > 0 ? agg : '';
            }, 'Added: ')
            .concat(deletedDeepItems.reduce((agg, x, i) => { 
                !!i ? agg = agg.concat(`${x}, `) : agg.concat(`${x} || `);
                return deletedDeepItems.length > 0 ? agg : '';
            }, 'Removed: '));
    };
    return deepChanges;
};

module.exports = async ({ existingData, model, comparer, isDifferent }, deep) => {
    let dataToChange = [];
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

        let changes = checkIfDatumShouldUpdateShallow({ dbDatum: item[0], pageDatum: datum, params: isDifferent, deep });
        let deepChanges = checkIfDatumShouldUpdateDeep({ dbDatum: item[0], pageDatum: datum, deep });

        if(!!changes || !!deepChanges){
            dataToChange.push({ 
                changes,
                deepChanges,
                new: datum, 
                old: item[0], 
            });
        };
    });

    let dataToText = dataToChange.map((datum) => ({ ...datum.new, changes: datum.changes, deepChanges: datum.deepChanges })); // An array of changed/new data with details on what changed, 
    return { dataToChange, dataToText };
};
