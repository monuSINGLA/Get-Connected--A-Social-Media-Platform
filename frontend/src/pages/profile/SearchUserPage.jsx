import { FaSearch } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";


const SearchUserPage = () => {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);



  const { mutate: searchUser, isPending, isError, error } = useMutation({
    mutationFn: async (username) => {
      if(!username)return 
      try {
        const res = await fetch(`api/v1/users/profile/${username.trim()}`);
        const user = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(user.error);
        setData(user);
      } catch (error) {
        throw new Error(error.message);
      }
    }
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <form
            className="w-full flex"
            onSubmit={async (e) => {
              e.preventDefault();
              if(!username) return
              searchUser(username)
              setUsername("")
            }}
          >
            <input
              placeholder="Search Username"
              type="text"
              className="w-full flex-1 rounded-md p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              type="submit"
              className="p-2  rounded-md hover:bg-stone-900 transition-all duration-300"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>
        </div>
        {isPending && (
          <div className="flex justify-center items-center w-full h-1/2 ">
            <LoadingSpinner />
          </div>
        )}

        {data && (
          <Link to={`/profile/${data?.username}`} className="flex hover:bg-gray-800 p-4 gap-5">
            
            <div className="avatar">
              <div className="w-20 rounded-full">
                <img src={data?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
            <div className="">
              <p className="text-xl font-bold">{data?.fullName}</p>
              <p>
                @<span>{data?.username}</span>
              </p>
              <p className="text-gray-600">{data?.followers?.length} Followers</p>
            </div>
          </Link>
        )}
        {isError && <div className="flex justify-center items-center w-full ">
            {error.message}
          </div> }
      </div>
    </>
  );
};

export default SearchUserPage;
