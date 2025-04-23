const mongo=require("mongoose")
async function dbConnection(url) {
    return mongo.connect(url);
}

module.exports=dbConnection;