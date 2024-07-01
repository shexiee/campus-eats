import React from "react";
// import { Route, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginSignUp from "./LoginSignUp";
import Home from "./Home";

const PublicRoute = ({Component}) => {
    const {currentUser} = useAuth();
    // const navigate = useNavigate();
    if(currentUser){
        console.log("navigating to home", currentUser);
    }
    return currentUser ? <Home /> : <Component/>
}

export default PublicRoute;