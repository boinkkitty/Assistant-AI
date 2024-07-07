import React, {ReactNode, useEffect} from 'react';
import {useTokenContext} from "../../components/TokenContext/TokenContext.jsx";
import {Navigate, Outlet} from 'react-router-dom'

/**
 * A Functional React component that redirects user to the outlet if a login token exists.
 * @component
 * @returns {ReactNode} A React element that renders the outlet of navigation component depending on the token.
 */
function PrivateRoutes() {
    const {tokenStatus} = useTokenContext()
    const [token, setToken] = tokenStatus

    const localToken = localStorage.getItem("token")

    useEffect(() => {
        if (localToken) {
            setToken(localToken)
        }
    }, [])

    return (
        token ? <Outlet/> : <Navigate to="/login"/>
    );
}

export default PrivateRoutes;