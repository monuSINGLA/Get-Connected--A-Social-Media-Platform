import express from 'express'
import donenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import connectMongoDB from './db/connectMongoDB.js'
import cookieParser from 'cookie-parser'

donenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/v1/auth", authRoutes)

app.listen(PORT, ()=>{
    console.log(`server is running on port : ${PORT}`)
    connectMongoDB()
})