import { Link } from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { FaTrash } from "react-icons/fa";

import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import toast from "react-hot-toast";

const NotificationPage = () => {
	const queryClient = useQueryClient()
	
	const {data: notifications , isLoading} = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/v1/notifications");
				const data = await res.json()
				if(!res.ok) throw new Error(data.error || "Something went wrong")
				return data
			} catch (error) {
				throw new Error(error.message)
			}
		}
	})

	const {mutate:deleteNotifications, isPending} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/v1/notifications/delete",{
					method: "DELETE",
				})
				const data = await res.json()

				if(!res.ok) throw new Error(data.error || "Something went wrong")
				
			} catch (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully")
			queryClient.invalidateQueries({queryKey: ["notifications"]})
		},
		onError : (error) => {
			toast.error(error.message)
		}
	})


	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
						<div className='m-1 flex justify-center items-center gap-1'>
							Delete all
							{isPending? <LoadingSpinner size="sm"/> : <FaTrash className="cursor-pointer hover:text-red-600" onClick={deleteNotifications}/>}
						</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;