import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";
import PostCard from "../components/postcard.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";



const HomePage = () => {
    const { userAuth: { access_token } } = useContext(UserContext);

    let [posts, setPosts] = useState(null);


    useEffect(() => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/feed", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(({ data: { feedPosts } }) => {
                setPosts(feedPosts)
            }).catch(err => {
                console.log(err);
            })
        }

    }, [access_token])
    return (
        <>
            {
                access_token ?
                    <>
                        <div className="mx-auto max-w-[610px] w-full p-2">
                            <div className='flex justify-between mt-14'>
                                <Link to="/editor">
                                    <button
                                        className="btn-dark pr-10 pl-10"
                                    >
                                        Write
                                    </button>
                                </Link>
                            </div>
                            <div className="mt-10 flex-col">
                                {
                                    posts == null ?
                                        <Loader/>
                                        :
                                        (
                                            posts.length ?
                                                posts.map((post, i) => {
                                                    return <AnimationWrapper
                                                        key={i}
                                                        transition={{
                                                            duration: 1,
                                                            delay: i * 0.1
                                                        }}>
                                                        <PostCard
                                                            post={post}
                                                            index={i}
                                                        />
                                                    </AnimationWrapper>

                                                })
                                                :
                                                <NoDataMessage message="No Posts Found" />
                                        )
                                }
                            </div>
                        </div>
                    </>
                    :
                    <Navigate to="/signin" />

            }

        </>


    )
}

export default HomePage
