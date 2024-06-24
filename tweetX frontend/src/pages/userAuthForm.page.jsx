import React, { useContext } from 'react'
import InputBox from '../components/input.component'
import { Link, Navigate } from "react-router-dom"
import { Toaster, toast } from "react-hot-toast"
import AnimationWrapper from '../common/page-animation'
import axios from "axios"
import { storeInSession } from '../common/session'
import { UserContext } from '../App'
import bgUser from "../imgs/bgUser.png"

const UserAuthForm = ({ type }) => {

    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)

    const userAuthThroughServer = (serverRoute, formData) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({ data }) => {
                storeInSession("user", JSON.stringify(data))

                setUserAuth(data)
            })
            .catch(({ response }) => {
                toast.error(response.data.error)
            })

    }

    const handleSubmit = (e) => {
        e.preventDefault();


        let serverRoute = type == "sign-in" ? "/signin" : "/signup"

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        let form = new FormData(formElement);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        console.log(formData)
        let { fullname, email, password, cpassword } = formData;
        if (fullname) {
            if (fullname.length < 3) {
                return toast.error("Fullname must be at least 3 letters long")
            }
        }
        if (!email.length) {
            return toast.error("Enter Email")
        }
        if (!emailRegex.test(email)) {
            return toast.error("Email is invalid")
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
        }
        if (cpassword) {
            if (password !== cpassword) {
                return toast.error("Confirm Password should match")
            }
        }
        userAuthThroughServer(serverRoute, formData);
    }

    return (
        access_token ?
            <Navigate to="/" />
            :
           
                <AnimationWrapper keyValue={type}>
                 <div className='bg-cover bg-center h-[99.5vh] auth-div' >
                    <nav className='navbar z-50 '>
                        <Link to="#" className="flex-none w-10">
                            <h1 className="text-orange text-3xl font-semibold">TweetX</h1>
                        </Link>
                    </nav>

                    <section className="mt-10 flex items-center md:justify-start justify-center ">
                        <Toaster
                            position="top-right"
                            reverseOrder={false}
                            gutter={8}
                            containerClassName="notification-toast"
                        />
                        <div className='flex flex-col gap-20 w-[80%] max-w-[300px]'>
                            <div>
                                {
                                    type == "sign-in" ?
                                        <Link to="/signup" >
                                            <button className='btn-light p-2 rounded-md pr-8 pl-8 ' >
                                                <h1 className='font-medium text-xl text-dark-grey'>
                                                    Create Account
                                                </h1>
                                            </button>
                                        </Link>
                                        :
                                        <Link to="/signin" >
                                            <button className='btn-light p-2  rounded-md pr-10 pl-10'>
                                                <h1 className='font-medium text-xl text-dark-grey'>
                                                    Login
                                                </h1>
                                            </button>
                                        </Link>

                                }
                            </div>
                            <form id='formElement' >

                                <h1 className="text-[30px] font-semibold text-dark-grey capitalize 
                mb-16">
                                    {type == "sign-in" ?
                                        "Login"
                                        : "Create Account"}
                                </h1>
                                {
                                    type !== "sign-in" ?
                                        <InputBox
                                            name="fullname"
                                            type="text"
                                            placeholder="Full Name"
                                            icon="fi-rr-user"
                                        />
                                        : ""
                                }

                                <InputBox
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    icon="fi-rr-envelope"
                                />
                                <InputBox
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    icon="fi-rr-key"
                                />
                                {
                                    type !== "sign-in" ?
                                        <InputBox
                                            name="cpassword"
                                            type="password"
                                            placeholder="Confirm Password"
                                            icon="fi-rr-key"
                                        />
                                        : ""
                                }
                                <div className='flex justify-between mt-16'>
                                    <Link to="#" className='link text-dark-grey'>Forgot Password?</Link>
                                    <button
                                        className="btn-dark "
                                        type="submit"
                                        onClick={handleSubmit}
                                    >
                                        {type.replace("-", " ")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
            </div>
                </AnimationWrapper>
    )
}

export default UserAuthForm
