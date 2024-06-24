import React, {useState, useEffect, useContext } from 'react'
import UserCard from '../components/usercard.component'
import { UserContext } from '../App'
import Loader from '../components/loader.component'
import axios from "axios"
import { Toaster, toast } from 'react-hot-toast'
import NoDataMessage from '../components/nodata.component'
import AnimationWrapper from '../common/page-animation'

const UserPage = () => {
  let { userAuth: { access_token } } = useContext(UserContext);
  let [users, setUsers] = useState(null);

  useEffect(() => {
    if (access_token) {
      axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/all-users", {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
        .then(({ data }) => {
          setUsers(data.users)
        })
        .catch(err => {
          console.log(err);
        })
    }

  }, [access_token])


  return (
    <AnimationWrapper>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="notification-toast"
      />
      <div className='mx-auto max-w-[610px] w-full p-2'>
        <div className='mt-10 flex-col'>
          {
            users == null ?
              <Loader />
              :
              (
                users.length ?
                  users.map((user, i) => {
                    return <AnimationWrapper
                      key={i}
                      transition={{
                        duration: 1,
                        delay: i * 0.1
                      }}>
                      <UserCard
                        user={user}
                        inPageState={0}
                        index={i}
                      />
                      <hr className="w-full border-b border-light-grey" />
                    </AnimationWrapper>

                  })
                  :
                  <NoDataMessage message="No Users Found" />
              )
          }
        </div>

      </div>

    </AnimationWrapper>
  )
}

export default UserPage
