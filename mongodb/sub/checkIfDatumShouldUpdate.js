module.exports = checkIfDatumShouldUpdate = ({ params, dbDatum, pageDatum }) => {
    let isDifference = !params.every((param) => pageDatum[param] === dbDatum[param]); // Once a single difference is noticed, will return false. Otherwise, will return true.
    return isDifference;
};