
const mongoose=require('mongoose')
const mongoURI=process.env.mongoURI;
const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("successfully connected");
    })
} 
module.exports=connectToMongo