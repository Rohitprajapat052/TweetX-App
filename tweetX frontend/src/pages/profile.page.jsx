import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import AnimationWrapper from '../common/page-animation'
import Loader from '../components/loader.component'
import { UserContext } from '../App'
import InPageNavigation from '../components/inpage-navigation.component'
import NoDataMessage from '../components/nodata.component'
import PostCard from '../components/postcard.component'
import UserCard from '../components/usercard.component'

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: ""
    },
    account_info: {
        total_followers: 0,
        total_posts: 0,
        total_followings: 0,
    },
    joinedAt: " "
}
const ProfilePage = () => {
    // let { id: profileId } = useParams();
    let [profile, setProfile] = useState(profileDataStructure);
    let [posts, setPosts] = useState(null);
    let [followings, setFollowings] = useState(null);
    let [followers, setFollowers] = useState(null);

    const [inPageState, setInPageState] = useState(0);

    let { personal_info: { fullname, username: profile_username, profile_img }} = profile;

    let { userAuth: { username:profileId , access_token } } = useContext(UserContext);

    const getPosts = ({ user_id }) => {
        user_id = user_id == undefined ? posts.user_id : user_id;
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-posts", {
            author: user_id
        })
            .then(async ({ data }) => {
                setPosts(data.posts)
            })
    }

    const getFollowings = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/followings", {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(async ({ data }) => {
                setFollowings(data.users);
            })
    }

    const getFollowers = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/followers", {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(async ({ data }) => {
                setFollowers(data.users);
            })
    }


    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
            username: profileId
        })
            .then(({ data: user }) => {
                setProfile(user)
                getPosts({ user_id: user._id })
            })
            .catch(err => {
                console.log(err)
            })
    }


    useEffect(() => {
        console.log(inPageState)
        if (access_token) {
            fetchUserProfile()
            getFollowings()
            getFollowers()
        }
    }, [access_token, inPageState])



    return (
        <>
                <div className='mx-auto max-w-[610px]  p-2 w-full mt-20 ' >
                    <div className='flex gap-12 h-[200px] '>
                        <img src={profile_img} className='w-[80px] h-[80px] rounded-full bg-grey' />
                        <div className='w-[500px] h-[100px] mt-6 grid content-around'>
                            <h1 className='font-medium w-full font-bold text-2xl capitalize  '>
                                {fullname}
                                <p className='text-sm text-grey'> @{profile_username}</p>
                            </h1>
                            <div className='flex w-full justify-between'>
                                <p className='text-grey text-md'>Posts : {posts?.length} </p>
                                <p className='text-grey text-md '>Followers : {followers?.length} </p>
                                <p className='text-grey text-md'>Followings : {followings?.length} </p>
                            </div>
                        </div>
                    </div>
                    <hr className='w-full border-light-grey' />

                    <InPageNavigation routes={["Posts", "Followers", "Followings"]} defaultActiveIndex={inPageState} setInPageState={setInPageState}>
                        {
                            posts == null ? <Loader /> :
                                posts.length ?
                                    <>
                                        {
                                            posts.map((post, i) => {
                                                return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                                                    <PostCard
                                                        post={post}
                                                    />

                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    :
                                    <NoDataMessage message="No published posts" />
                        }

                        {
                            followers == null ? <Loader /> :
                                followers.length ?
                                    <>
                                        {
                                            followers.map((user, i) => {
                                                return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>

                                                    <UserCard
                                                        user={user} inPageState={inPageState}
                                                    />
                                                    <hr className="w-full border-b border-light-grey" />
                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    :
                                    <NoDataMessage message="No Followers" />
                        }
                        {
                            followings == null ? <Loader /> :
                                followings.length ?
                                    <>
                                        {
                                            followings.map((user, i) => {
                                                return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>

                                                    <UserCard
                                                        user={user} inPageState={inPageState}
                                                    />
                                                    <hr className="w-full border-b border-light-grey" />
                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    :
                                    <NoDataMessage message="No Followings" />
                        }
                    </InPageNavigation>
                </div>
        </>
    )
}

export default ProfilePage
