import React, { useState, useEffect, ReactNode, useCallback } from "react"
import "../../index.css"
import { useNavigate } from "react-router-dom";
import { useTokenContext } from "../TokenContext/TokenContext.jsx";
import { Items, isIconOwned } from "../../utilities/ShopItemUtilities.js";

/**
 * A React component that retrieves the current user data and points to display them.
 * @component
 * @returns {ReactNode} A React element that renders the user's info.
 */
const UserInfo = () => {
    const navigate = useNavigate()

    const {tokenStatus, userInfo, userIcon} = useTokenContext()
    
    /**
     * The current token and setter function to update it.
     * @type {[string, function]}
     */
    const [token, setToken] = tokenStatus

    /**
     * The current user data and setter function to update it.
     * @type {[string, function]}
     */
    const [userData, setUserData] = userInfo

    /**
     * The current user profile icon string and setter function to update it.
     * @type {[string, function]}
     */
    const [profileIcon, setProfileIcon] = userIcon
    const [icon, setIcon] = useState(null)

    /**
     * The current username of the logged in user and setter function to update it.
     * @type {[string, function]}
     */
    const [username, setUsername] = useState("")

    /**
     * The current points of the logged in user and setter function to update it.
     * @type {[string, function]}
     */
    const [points, setPoints] = useState(0)

    /**
     * The Express API URL for this React app.
     * @type {string}
     */
    const expressApiUrl = import.meta.env.VITE_EXPRESS_API_URL

    /**
     * @function useEffect
     * @description If token exists, get user info
     */
    useEffect(() => {
        if (token) {
            getUserInfo()
        }
    },[token])

    /**
     * @function useEffect
     * @description If user data is changed, setusername and setpoints
     */
    useEffect(() => {
        setUsername(userData?.username)
        setPoints(userData?.points)
    }, [userData]);

    /**
     * @function useEffect
     * @description Gets the users items by username
     */
    useEffect(() => {
        if (username) {
            getUserItemsByUsername()
        }
    }, [username])

    /**
     * @function useEffect
     * @description Updates the icon whenever a new one is equipped.
     */
    useEffect(() => {
        const updateIcon = async () => {
            const icon = await import(`../../AppImages/Profile Icons/${profileIcon}.png`)
            setIcon(icon.default)
        }
        updateIcon()
    }, [profileIcon])

    /**
     * Imports the user's profile icon.
     * @param {Array<Object>} items The list of items owned by the user.
     */
    const importIcon = async (items) => {
        try {
            /**
             * The list of items owned by the user based on the itemId.
             * @type {Array<Object>}
             */
            const mappedItems = [...items].map(each => Items[each.itemId-1])
            const storageIcon = localStorage.getItem("profileIcon")
            if (storageIcon && isIconOwned(storageIcon, mappedItems)) {
                const icon = await import(`../../AppImages/Profile Icons/${storageIcon}.png`)
                setIcon(icon.default)
                setProfileIcon(storageIcon)
                localStorage.setItem("profileIcon", storageIcon)
            } else {
                const defaultName = "Default"
                const icon = await import(`../../AppImages/Profile Icons/${defaultName}.png`)  
                setIcon(icon.default)
                setProfileIcon(defaultName)
                localStorage.setItem("profileIcon", defaultName)
            }  
        } catch (err) {
            console.error("Failed to Import Icon: ", err.message)
        }
    }

    /**
     * @function
     * @description API CALL to get user items
     */
    const getUserItemsByUsername = async () => {
        try {
            const response = await fetch(`${expressApiUrl}user/${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("User not found");
            }

            const data = await response.json();
            setUserData(data.userDetails);
            await importIcon(data.userItems);
        } catch (err) {
            console.log(`Error getting by username`)
        }
    }

    const getUserInfo = async () => {
        const dataToPost = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        };

        try {
            const res = await fetch(`${expressApiUrl}GetUserInfo`, dataToPost)
            if (res.ok) {
                // console.log("UserInfo successfully retrieved")
            } else {
                // console.log("Invalid User/Info")
            }
            const data = await res.json()

            if(data) {
                setUserData(data)
            }
        } catch (error) {
            console.error("Failed to Fetch User Info!", error.message)
        }
    }


    /** 
     * Clears token and userData on log out, to login page.
     */
    const onLogOut = () => {
        setToken("")
        setUserData({
            username: null,
            id: null,
            dateOfBirth: null,
            points: null,
        })
        localStorage.removeItem("token")
        navigate("/login")
    }

    /** 
     * To Sign Up Page
     */
    const onSignUp = () => {
        navigate("/SignUp")
    }

    /**
     *  To Profile Page if thereis
     */
    const onProfile = () => {
        if (token) {
            navigate(`/users/${username}`)
        }
    }

    /** 
     * Username, points and log out shown if user logged in, else sign up and login.
     */
    const userBar = () => {
        if (token) {
            return (
                <>
                    <div className="userInfo">
                        <div onClick={onProfile} className="nameAndPoints">
                            <p className="username">{username}</p>
                            <p className="points">{points} pts</p>
                        </div>
                        { icon ? <img src={icon} onClick={onProfile}/> : <p>Loading Icon...</p>} 
                        <button className="navBarBtn" onClick={onLogOut}>Log Out</button>
                    </div>
                </> 
            )
        } else {
            return (
                <div className="userInfo">
                    <button className="navBarBtn" onClick={onLogOut}>Log In</button>
                    <button className="navBarBtn" onClick={onSignUp}>Sign Up</button>
                </div>
            )
        }
    }

    return(
        <>
            {userBar()}
        </>
    )
}
export default UserInfo;