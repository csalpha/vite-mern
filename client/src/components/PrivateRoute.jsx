import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../Store";

// Create a PrivateRoute component that takes in children as props
const PrivateRoute = ({ children }) => {
  // Get the state from the Store context
  const { state } = useContext(Store);
  // Get the userInfo from the state
  const { userInfo } = state;

  // If there is userInfo,
  return userInfo ? (
    // render the children components
    children
  ) : (
    // else redirect to signin page
    <Navigate to='/signin' />
  );
};

export default PrivateRoute;
