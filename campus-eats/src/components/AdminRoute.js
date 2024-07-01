import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginSignUp from "./LoginSignUp";
import Home from "./Home";
import axios from 'axios';
import DasherHome from "./DasherHome";
import ShopManage from "./ShopManage";

const AdminRoute = ({ Component }) => {
  const { currentUser } = useAuth();
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchUserRole = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/user-role/${currentUser.uid}`);
          setAccountType(response.data.accountType);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setLoading(false);
        }
      };
      
      fetchUserRole();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return <div>Checking permissions...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <LoginSignUp />;
  }

  if (accountType === 'admin') {
    return <Component />;
  }

  if(accountType === 'dasher'){
    return <DasherHome />;
  }

  if (accountType === 'shop') {
    return <ShopManage />;
  }
  return <Home />;
};

export default AdminRoute;
