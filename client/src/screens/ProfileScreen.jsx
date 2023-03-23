import Axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";

// This is a reducer function that takes two arguments: state and action
const reducer = (state, action) => {
  /* The switch statement below checks the action type 
     and returns updated state based on its value */
  switch (action.type) {
    // If the action type is "FETCH_REQUEST"
    case "FETCH_REQUEST":
      //  Returns a new state object with loading set to true
      return {
        ...state, // creating a copy of the current state
        loading: true,
      };
    // If the action type is "FETCH_SUCCESS"
    case "FETCH_SUCCESS":
      //  Returns a new state object with loading set to false
      return {
        ...state, // creating a copy of the current state
        loading: false,
      };
    // If the action type is "FETCH_FAIL"
    case "FETCH_FAIL":
      //  Returns a new state object with loading set to false and an error message.
      return {
        ...state, // creating a copy of the current state
        loading: false,
        error: action.payload,
      };
    // If the action type is "UPDATE_REQUEST"
    case "UPDATE_REQUEST":
      //  Returns a new state object with loadingUpdate set to true
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: true,
      };
    // If the action type is "UPDATE_SUCCESS"
    case "UPDATE_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: false,
      };
    // If the action type is "UPDATE_FAIL"
    case "UPDATE_FAIL":
      //  Returns a new state object with loadingUpdate set to false
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: false,
      };
    // The default statement
    default:
      //  returns the current state.
      return state;
  }
};

const ProfileScreen = () => {
  // Get the state and dispatch from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);

  // Get the userInfo from the state
  const { userInfo } = state;

  // destructures the return value of useReducer into { loading, error, loadingUpdate } and dispatch
  const [
    { loading, error, loadingUpdate },
    dispatch, // function used to update the state
  ] = useReducer(
    reducer, // reducer function
    {
      loading: true,
      error: "",
    } // initial state ( current values of the state )
  );
  // Declare and initialize state variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSeller, setIsSeller] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerLogo, setSellerLogo] = useState("");
  const [sellerDescription, setSellerDescription] = useState("");

  // useEffect hook to fetch user data from the API
  useEffect(
    () => {
      const fetchData = async () => {
        // dispatch FETCH_REQUEST action
        dispatch({ type: "FETCH_REQUEST" });
        try {
          // make a GET request to the API
          const { data } = await Axios.get(`/api/users/${userInfo._id}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });

          // set user name
          setName(data.name);

          // set user email
          setEmail(data.email);

          // check if user is a seller
          if (data.seller) {
            // set isSeller flag
            setIsSeller(data.isSeller);

            // set seller name
            setSellerName(data.seller.name);

            // set seller logo
            setSellerLogo(data.seller.logo);

            // set seller description
            setSellerDescription(data.seller.description);
          }

          // dispatch FETCH_SUCCESS action
          dispatch({ type: "FETCH_SUCCESS" });
        } catch (error) {
          // dispatch FETCH_FAIL action with error payload
          dispatch({
            type: "FETCH_FAIL",
            payload: getError(error),
          });
        }
      };

      // call function
      fetchData();
    },
    [dispatch, userInfo] // dependecies array
  );

  // This function handles the submission of the form
  const submitHandler = async (e) => {
    // Prevent default action
    e.preventDefault();

    // Dispatch an action to update the request
    dispatch({ type: "UPDATE_REQUEST" });
    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
      } else {
        // Make a PUT request to the API
        const { data } = await Axios.put(
          "/api/users/profile",
          {
            name,
            email,
            password,
            sellerName,
            sellerLogo,
            sellerDescription,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        // Dispatch an action to update success
        dispatch({
          type: "UPDATE_SUCCESS",
        });

        // Dispatch an action to sign in the user
        ctxDispatch({ type: "USER_SIGNIN", payload: data });
        // Store the user info in local storage
        localStorage.setItem("userInfo", JSON.stringify(data));
        // Show a success message
        toast.success("User updated successfully");
      }
    } catch (error) {
      // Show an error message
      toast.error(getError(error));
      // Dispatch an action to update failure
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  return (
    <div className='container small-container'>
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
          <h1 className='mb-4 text-xl'>Update Profile</h1>
          <div className='mb-4'>
            <label htmlFor='name'>Name</label>
            <input
              type='text'
              className='w-full'
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              className='w-full'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='password'>Password</label>
            <input
              className='w-full'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <input
              className='w-full'
              type='password'
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {isSeller && (
            <>
              <h2>Seller</h2>

              <div className='mb-4'>
                <label>seller Name</label>
                <input
                  className='w-full'
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  required
                />
              </div>

              <div className='mb-4'>
                <label>Seller Logo</label>
                <input
                  className='w-full'
                  value={sellerLogo}
                  onChange={(e) => setSellerLogo(e.target.value)}
                  required
                />
              </div>

              <div className='mb-4'>
                <label>Seller Logo</label>
                <input
                  className='w-full'
                  value={sellerLogo}
                  onChange={(e) => setSellerLogo(e.target.value)}
                  required
                />
              </div>
              <div
                controlId='floatingTextarea'
                label='Comments'
                className='mb-4'
              >
                <input
                  className='w-full'
                  as='textarea'
                  placeholder='Leave a comment here'
                  value={sellerDescription}
                  onChange={(e) => setSellerDescription(e.target.value)}
                />
              </div>
            </>
          )}
          <div className='mb-4'>
            <button
              className='primary-button'
              type='submit'
              disabled={loadingUpdate}
            >
              Update
            </button>
          </div>
          {loadingUpdate && <LoadingBox></LoadingBox>}
        </form>
      )}
    </div>
  );
};

export default ProfileScreen;
