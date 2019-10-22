module.exports = async (Model) => {
    let data = await Model.find({});
    data = data.map(datum => datum.toObject());
    return data;
};