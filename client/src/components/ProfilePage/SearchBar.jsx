import React, { useState, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useTokenContext } from "../TokenContext/TokenContext.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"

/**
 * A React component that displays the search bar to search for other users.
 * @component
 * @returns {ReactNode} A React element that renders the search bar.
 */
const SearchBar = () => {
    const {tokenStatus} = useTokenContext()
    const [token, setToken] = tokenStatus

    const [username, setUsername] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    /**
     * The Express API URL for this React app.
     * @type {string}
     */
    const expressApiUrl = process.env.VITE_EXPRESS_API_URL


    const handleSearch = async () => {
        try {
            const response = await fetch(`${expressApiUrl}user/${username}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error("User not found") // Handle non-2xx status codes
            }
            const exists = await response.json()
            if (exists) {
                navigate(`/users/${username}`)
                setError("")
            } else {
                setError(`User "${username}" not found`)
            }
        } catch (error) {
            console.error("Error searching for user:", error)
            setError("Error searching for user. Please try again.")
        }
    }

    const handleInputChange = (event) => {
        setUsername(event.target.value)
    }

    const handleKeyDown = (event) => {
        if(event.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="searchBarAndErrorBox">
            <div className="searchBarBox">
                <input
                    className="searchBar"
                    type="text"
                    placeholder="Enter username..."
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button className="searchBarBtn" onClick={handleSearch}>
                    <FontAwesomeIcon icon={faSearch}/>
                </button>
            </div>
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default SearchBar
