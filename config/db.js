const mongoose = require("mongoose")

// const uri = "mongodb://samydjouderocantero:Gp2pUvHjsmcqbcmS@nocontext.51zabuw.mongodb.net/?retryWrites=true&w=majority"

// const uri = "mongodb+srv://samsssd:aaXZfOvuDCjGwcMS@cluster0.flkfm.mongodb.net/?retryWrites=true&w=majority"
const uri = "mongodb://samsssd:aaXZfOvuDCjGwcMS@cluster0-shard-00-00.flkfm.mongodb.net:27017,cluster0-shard-00-01.flkfm.mongodb.net:27017,cluster0-shard-00-02.flkfm.mongodb.net:27017/?ssl=true&replicaSet=atlas-zbj2fm-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}   

module.exports = connectDB;
