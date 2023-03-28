import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../Store";

// Create a functional component called AdminRoute
const AdminRoute = ({ children }) => {
  // Get the state from the Store context
  const { state } = useContext(Store);
  // Get the userInfo object from the state
  const { userInfo } = state;

  // if the user is an admin
  return userInfo && userInfo.isAdmin ? (
    // renders the children component
    children
  ) : (
    // otherwise redirect to the signin page
    <Navigate to='/signin' />
  );
};

export default AdminRoute;
