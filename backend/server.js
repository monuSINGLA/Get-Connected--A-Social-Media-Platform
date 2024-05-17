import express from 'express'
import donenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary} from 'cloudinary'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'

import connectMongoDB from './db/connectMongoDB.js'

donenv.config()

//Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())

// routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/posts", postRoutes)

app.listen(PORT, ()=>{
    console.log(`server is running on port : ${PORT}`)
    connectMongoDB()
})