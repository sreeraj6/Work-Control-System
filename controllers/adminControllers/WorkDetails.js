var db = require('../../config/connection');

module.exports = {
    newWorks: () => {
        return new Promise(async (resolve,reject) => {
            let pendingWorks = await db.get().collection('complaints').find({status:{$eq:1}}).toArray();
            resolve(pendingWorks)
        })
    }
}