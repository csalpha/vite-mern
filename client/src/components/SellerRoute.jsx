import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../Store";

// Create a functional component called SellerRoute
const SellerRoute = ({ children }) => {
  // Get the state from the Store context
  const { state } = useContext(Store);
  // Get the userInfo object from the state
  const { userInfo } = state;

  // if the user is an seller
  return userInfo && userInfo.isSeller ? (
    // renders the children component
    children
  ) : (
    // otherwise redirect to the signin page
    <Navigate to='/signin' />
  );
};

export default SellerRoute;
