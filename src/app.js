import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";

const app = express();
const Limit = "16kb"
// By using cors({origin : process.env.CORS_OR}), You would only allow a frontend server who has same origin or url as CORS_OR. By this you are limiting to send request to server
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

// By this we are limiting user to send only 16kb of json data which will help us to stop server from carshing

app.use(express.json({limit:Limit}))

// By this we are telling express that data from url have different syntax for same thing like for space " ", Some browser change it to "+" and other change it to "%20". For this we are useing urlencoded. "URLENCODED" is enough for mostly work but we are giving "extended:true" to have object in object , Limit have same function as json

app.use(express.urlencoded({extended:true, limit:Limit}))

// It is use to store public assit like pdf, pngs etc

app.use(express.static("public"))

app.use(cookieParser())

// rout import

import userRouter from './routes/user.routes.js'
app.use("/api/v1/users",userRouter)


export {app }
