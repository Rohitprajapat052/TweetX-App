import { useContext, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from '../common/session';
const Navbar = () => {
    const { setUserAuth, userAuth: { username } } = useContext(UserContext);

    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation();
    let navigate = useNavigate();

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null })
        navigate("/signin")
    }


    const navMenu = [
        {
            name: "Feed",
            path: "/"
        },
        {
            name: "User",
            path: "/users"
        },
        {
            name: "Profile",
            path: "/profile"
        }
    ]

    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    return (
        <>
            <header className="bg-white">
                <nav className="flex justify-between items-center  md:px-20 px-2 py-2 w-full mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <div>
                        <Link to="/" className="flex-none w-10">
                            <h1 className="text-orange text-3xl font-semibold">TweetX</h1>
                        </Link>
                    </div>
                    <div className="flex gap-10">
                        <div
                            className={`nav-links duration-500 md:static absolute bg-white md:min-h-fit min-h-[30vh] left-0 top-[-100%] md:w-auto w-full flex items-center px-5 ${isMenuOpen ? `top-[8%]` : ``}`}
                        >
                            <ul className="flex md:flex-row flex-col md:items-left md:gap-[2vw] gap-2 w-full">
                                {
                                    navMenu.map((menu) => {
                                        const isActive = location.pathname === menu.path;
                                        return <li onClick={toggleMenu} key={menu.path} >
                                            {!collapsed && <Link to={menu.path} className={`md:flex md:gap-2 link font-semibold ${isActive && ` text-orange bg-light-grey`}`}>
                                                <p className="text-[19px] text-center">{menu.name}</p>
                                            </Link>}
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                className='text-left p-2 btn-light'
                                onClick={signOutUser}
                            >
                                <h1 className='font-semibold text-xls'>Sign Out</h1>
                            </button>
                            <i onClick={toggleMenu} className={`text-3xl cursor-pointer md:hidden fi ${isMenuOpen ? `fi-rr-cross-small ` : `fi-br-bars-staggered`}`}></i>
                        </div>
                    </div>
                </nav>
            </header>
            <Outlet />
        </>
    )
}

export default Navbar;
