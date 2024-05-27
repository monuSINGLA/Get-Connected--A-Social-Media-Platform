import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'


const useUpdateUserProfile = () => {

    const queryClient = useQueryClient()

 const {mutateAsync: upadateProfile, isPending} = useMutation({
    mutationFn : async (formdata) => {
        try {
            const res = await fetch("/api/v1/users/update", {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(formdata)
            })

            const data = await res.json()

            if(!res.ok) throw new Error(data.error || "Something went wrong")
            return data
        } catch (error) {
            throw new Error(error.message)
        }
    },
    onSuccess : ()=>{
        toast.success("Profile updated successfully")
        Promise.all([
            queryClient.invalidateQueries({queryKey: ["authUser"]}),
            queryClient.invalidateQueries({queryKey: ["userProfile"]}),
            queryClient.invalidateQueries({queryKey: ["posts"]})
        ])


    },
    onError: (error)=>{
        toast.error(error.message)
    }
 })

 return {upadateProfile, isPending}
}

export default useUpdateUserProfile