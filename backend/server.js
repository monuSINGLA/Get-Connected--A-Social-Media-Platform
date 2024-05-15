import express from 'express'
import donenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import connectMongoDB from './db/connectMongoDB.js'

donenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use("/api/v1/auth", authRoutes)

app.listen(PORT, ()=>{
    console.log(`server is running on port : ${PORT}`)
    connectMongoDB()
})