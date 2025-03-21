import { React, useState, ReactNode } from "react";
import NavBar from "../components/NavBar/NavBar.jsx";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import CryptoJS from "crypto-js";
import RenderError from "../components/RenderError/RenderError";
import { useTokenContext } from "../components/TokenContext/TokenContext";


/**
 * A React component that displays the Login page and handles any error while logging in.
 * @component
 * @returns {ReactNode} A React element that renders the login page.
 */
const Login = () => {
    /**
     * The username of the current user and setter function to update it.
     * @type {[string, function]}
     */
    const [username, setUsername] = useState("")

    /**
     * The password of the current user and setter function to update it.
     * @type {[string, function]}
     */
    const [password, setPassword] = useState("")

    /**
     * The state of whether the user is logging into the app and setter function to update it.
     * @type {[boolean, function]}
     */
    const [loggingIn, setLoggingIn] = useState(false)

    /**
     * The error faced by the current user while logging in and setter function to update it.
     * @type {[string, function]}
     */
    const [error, setError] = useState("")
    const {tokenStatus, } = useTokenContext()

    /**
     * The current token and setter function to update it.
     * @type {[string, function]}
     */
    const [token, setToken] = tokenStatus

    const navigate = useNavigate()

    /**
     * The Express API URL for this React app.
     * @type {string}
     */
    const expressApiUrl = import.meta.env.VITE_EXPRESS_API_URL

    /**
     * Sends User to the Home Page.
     */
    function sendToHomePage() {
        navigate("/")
    }

    /**
     * Function that handles a login failure.
     * @param {string} error Error faced by the current user while logging in.
     */
    function handleFailedLogin(error) {
        if (error == "Invalid Credentials") {
            setUsername("")
            setPassword("")
            setError("InvalidCreds")
        }
    }

    /**
     * Function that handles a successful login, hashes the user password and sends a POST request to verify the current user credentials.
     * @async
     * @param {*} e Login event.
     * @returns {Promise<void>} A promise that verifies the current user credentials and sets the JWT if successful.
     * @throws {Error} Throws an error if login fails.
     */
    const handleLogin = async (e) => {
        e.preventDefault()

        if(username == "") {
            setError("UsernameError")
            return
        }

        if(password == "") {
            setError("EmptyPW")
            return
        }

        setError("")
        setLoggingIn(true)

        /**
         * Hashing the user password using the SHA512 hashing algorithm from CryptoJS.
         * @type {string}
         */
        var hashedPW = CryptoJS.SHA512(password).toString()

        /**
         * The updated user data including the hashed password.
         * @type {Object}
         */
        const updatedData = {username, password: hashedPW}

        /**
         * Data to POST to the back-end to verify user credentials.
         * @type {Object}
         */
        const dataToPost = {
            method: "POST",
            body: JSON.stringify(updatedData),
            headers: {
                "Content-Type": "application/json"
            }
        }

        fetch(`${expressApiUrl}Login`, dataToPost)
            .then(res => {
                if (res.ok) {
                    // console.log("Login Successful!")
                    return res.json()
                } else {
                    res.text().then(text => handleFailedLogin(text))
                    setLoggingIn(false)
                }
            })
            .then(tokenResponse => {
                if (tokenResponse) {
                    const token = tokenResponse.token
                    localStorage.setItem("token", token)
                    setToken(token)
                    setLoggingIn(false)
                    sendToHomePage()
                }
            })
            .catch(error => {
                console.error("Login failed:", error.message)
                setLoggingIn(false)
            })
    }

    return (
        <div>
            <NavBar/>

            <div className="accountFormBox">
                <div className="accountFormInnerBox">
                    <form onSubmit={handleLogin}>
                        <h4 className="accountFormHeader">Login</h4>

                        {RenderError.renderUsernameError(error)}
                        {RenderError.renderInvalidCredentialsError(error)}
                        <input
                            type="text"
                            placeholder="Username"
                            className="usernameInput"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />

                        {RenderError.renderPWError(error)}
                        <input
                            type="password"
                            placeholder="Password"
                            className="passwordInput"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />

                        { loggingIn ? (
                            <div className="loggingInMsg">Logging In...</div>
                        ) : (
                            <div></div>
                        )}

                        <button type="submit" className="primary-btn">
                            Login
                        </button>
                        <div className="signUpContainer">
                            <span className="signUpPrompt">Don't have an account?</span>
                            <Link to="/signUp" className="signUpButton">Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login