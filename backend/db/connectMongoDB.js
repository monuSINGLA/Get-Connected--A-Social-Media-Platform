import mongoose from "mongoose";

const connectMongoDB = async ()=>{
    try {
        const connect =await mongoose.connect(process.env.MONGO_DB_URI)
        console.log(`MongoDB connected ${connect.connection.host}`)

    } catch (error) {
        console.log(`MonogoDB connection failed ${error.message}`)
        process.exit(1)
    }

}

export default connectMongoDB