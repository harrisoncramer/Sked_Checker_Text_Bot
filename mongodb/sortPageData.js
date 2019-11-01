module.exports = {
    shallowSort: async ({ pageData, dbData, comparer }) => {    
        let dbTitles = dbData.map(x => x[comparer]);
        let existingData = [];
        let newData = pageData.filter(x => {
            let pageTitle = x[comparer]; // Get title of doc.
            let i = dbTitles.indexOf(pageTitle);
            if(i === -1){ // If it's new...
                return true;
            }
            existingData.push(x)
            return false;
        });
    
        return { existingData, newData }
    }
}