import React from 'react'
import { getDay } from '../common/date'
const PostCard = ({post}) => {
let {author:{personal_info:{fullname, username, profile_img }}, des,publishedAt}=post;
    return (
        <div className="flex bg-white shadow-lg rounded-lg my-2 md:mx-auto p-2 w-full">
            <div className="flex items-start px-4 py-6 w-full">
                <img className="w-12 h-12 rounded-full object-cover mr-4 shadow" src={profile_img} alt="avatar" />
                <div className="mt-4 w-full">
                    <div className="flex items-center justify-between w-full">
                        <h1 className="text-xl font-medium text-dark-grey -mt-1 capitalize">{fullname}</h1>
                        <small className="md:text-sm text-[10px] text-grey">{getDay(publishedAt)} ago</small>
                    </div>
                    <p className="mt-3 text-grey text-sm md:text-left text-justify">
                      {des}
                    </p>
                </div>
            </div>
            <div className='flex items-center '>
                <div className='design'>
                        
                </div>
            </div>
        </div>
    )
}

export default PostCard
