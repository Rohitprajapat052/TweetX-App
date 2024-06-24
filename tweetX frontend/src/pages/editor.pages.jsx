import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom'
import PublishForm from '../components/publish-form.component'

export const blogStructure={

}
const Editor = () => {
    const [post, setPost] = useState(blogStructure)
    let { userAuth: { access_token } } = useContext(UserContext)

    return (
        <>
            {
                access_token === null ?
                    <Navigate to="/signin" />
                    :
                    <PublishForm post={post} setPost={setPost} />
            }
        </>
    )
}

export default Editor
