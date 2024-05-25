import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        const notifications = await Notification.find({to : userId})
        .populate({
            path: "from",
            select : "username profileImg"
        })

        await Notification.updateOne({to: userId},{read: true})

        res.status(200).json(notifications)

        
    } catch (error) {
        console.log("Error in getNotifications controller", error.message)
        res.status(500).json({error : "Internal Server Error"})
    }

}

const deleteNotifications = async (req, res) =>{
    try {
        const userId = req.user._id

        await Notification.deleteMany({to : userId})

        res.status(200).json({messgae: "Notifications deleted successfully"})
        
    } catch (error) {
        console.log("Error in deleteNotifications controller", error.message)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export {getNotifications, deleteNotifications}