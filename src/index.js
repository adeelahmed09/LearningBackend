import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("ERRR :",err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is listening on port :${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed !!! :: Error ",err);
})