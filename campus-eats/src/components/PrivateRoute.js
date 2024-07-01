import React from "react";
// import { Route, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginSignUp from "./LoginSignUp";

const PrivateRoute = ({Component}) => {
    const {currentUser} = useAuth();
    // const navigate = useNavigate();

    return currentUser ? <Component /> : <LoginSignUp/>
}

export default PrivateRoute;