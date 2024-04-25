const express = require("express");
const app = express();
// const dotenv = require('dotenv')
require('dotenv').config()
// console.log(process.env)
const port = process.env.PORT;
// console.log(port)
app.use(express.json());



var cors = require('cors')
app.use(cors())
app.use(express.json())
const connectToMongo=require('./db');
connectToMongo();


const authRouter=require('./routes/auth')
const noteRouter=require('./routes/note')
// const authRouter=require('../routes/auth')



// EXPRESS SPECIFIC STUFF


// PUG SPECIFIC STUFF
app.use('/api',authRouter);
app.use('/apinote',noteRouter);
 
// ENDPOINTS
app.get('/', (req, res)=>{
    
    res.send("hello   123");
    

});
// });
// app.post('/',(req,res)=>{
//     res.render('../routes/auth');
// })


app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
});