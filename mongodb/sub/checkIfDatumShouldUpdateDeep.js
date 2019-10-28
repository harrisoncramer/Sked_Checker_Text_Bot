module.exports = checkIfDatumShouldUpdateDeep = ({ params, dbDatum, pageDatum, deep }) => {
    let normalParams = params.filter(p => p !== deep);
    let isDifference = !normalParams.every(param => pageDatum[param] === dbDatum[param]); // Once a single difference is noticed, will return false. Otherwise, will return true.
    if(isDifference){
        return true;
    }
    isDifference = pageDatum[deep].filter(x => !dbDatum[deep].includes(x)).length + dbDatum[deep].filter(x => !pageDatum[deep].includes(x)).length;
    return isDifference;
};