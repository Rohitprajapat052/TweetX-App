import { Route, Routes } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import Navbar from "./components/navbar.component";
import HomePage from "./pages/home.page";
import UserAuthForm from "./pages/userAuthForm.page";
import PageNotFound from "./pages/404.page";
import { lookInSession } from "./common/session";
import UserPage from "./pages/user.page";
import Editor from "./pages/editor.pages";
import ProfilePage from "./pages/profile.page";

export const UserContext = createContext({})

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {
        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({
            access_token: null
        })
    }, []);

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
                <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
                <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
                <Route path="/" element={<Navbar />}>
                    <Route index element={<HomePage />} />
                    <Route path="/users" element={<UserPage/>} />
                    <Route path="/editor" element={<Editor/>} />
                    <Route path="/profile" element={<ProfilePage/>} />
                    <Route path="*" element={<PageNotFound />} />
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;