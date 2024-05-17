import React from "react";
import "./UserInfo.css";
import { useUserStore } from "../../Lib/UserStore";
const UserInfo = () => {
  const { currentUser } = useUserStore();
  return (
    <div className="userinfo    flex items-center  justify-between">
      <div className="user flex items-center  space-x-2  justify-center gap-1 ">
        <img
          src={currentUser.avatar || "./avatar.png"}
          alt=""
          className="w-[50px] h-[50px] object-cover rounded-full"
        />
        <h1 className="text-sm md:text-lg capitalize">
          {currentUser.username || ""}
        </h1>
      </div>
      <div className="icons flex gap-2 md:gap-3 items-center ">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo;
