import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import { Toaster, toast } from 'react-hot-toast'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom'
import axios from "axios"
const PublishForm = ({ post, setPost }) => {

    let characterLimit = 400;
    let navigate = useNavigate();
    let { userAuth: { access_token } } = useContext(UserContext);
    let { des } = post;
    const handleBlogDesChange = (e) => {
        let input = e.target;
        setPost({ ...post, des: input.value })
        console.log(post)
    }


    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const PublishForm = (e) => {
        if (e.target.classList.contains("disable")) {
            return;
        }
        if (!des.length || des.length > characterLimit) {
            return toast.error(`Write a description about your within ${characterLimit} characters to publish`)
        }
        let loadingToast = toast.loading("Publishing...");
        e.target.classList.add('disable');

        let postObj = { des }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-post", { ...postObj }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.classList.remove('disable');
                toast.dismiss(loadingToast);
                toast.success("Published 💐");

                setTimeout(() => {
                    navigate("/")
                }, 500)
            })
            .catch(({ response }) => {
                e.target.classList.remove('disable');
                toast.dismiss(loadingToast)
                return toast.error(response.data.error);
            })
    }


    return (
        <AnimationWrapper>
            <div className='max-w-[610px] p-10 mx-auto '>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    containerClassName="notification-toast"
                />
                <div className='border-grey lg:border-1 lg:pl-8'>
                    <p className='text-dark-grey mb-2 mt-9'>Write your story</p>
                    <textarea
                        className='h-40 resize-none leading-7 input-box pl-4'
                        maxLength={characterLimit}
                        defaultValue={des}
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    >
                    </textarea>
                    <p className='mt-1 text-dark-grey text-sm text-right'>
                        {characterLimit - des?.length?characterLimit - des?.length: 400 } characters left</p>



                    <button className='btn-dark px-8'
                        onClick={PublishForm}
                    >Publish</button>
                </div>
            </div>
        </AnimationWrapper>
    )
}

export default PublishForm
