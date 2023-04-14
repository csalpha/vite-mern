import Axios from "axios";
import React, { useState, useEffect, useReducer, useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";

// A reducer function takes in two parameters, state and action,
// and returns a new state based on the provided action.
const reducer = (state, action) => {
  // handle different types of actions.
  switch (action.type) {
    case "FETCH_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: true, // sets the loading flag to true
      };
    case "FETCH_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
      };
    case "FETCH_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        error: action.payload, // sets the error value based on the payload data
      };
    case "UPDATE_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: true, // sets the loadingUpdate flag to true
      };
    case "UPDATE_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: false, // sets the loadingUpdate flag to false
      };
    case "UPDATE_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpdate: false, // sets the loadingUpdate flag to false
      };

    default:
      // returns the current state
      return state;
  }
};

// Create a functional component called UserEditScreen
const UserEditScreen = (props) => {
  // destructuring the state and dispatch from useReducer hook
  const [
    { loading, error, loadingUpdate }, // state object
    dispatch, // dispatch
  ] = useReducer(
    reducer, // reducer function
    {
      loading: true, // sets loading flag to true
      error: "", // sets error to an empty string
    } // initial state object
  );

  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  /* The useNavigate hook allows for programmatic navigation
     between different routes in a React application.         */
  const navigate = useNavigate();

  // extract parameters from the URL
  const params = useParams();

  // Destructuring userId from the params object
  const { id: userId } = params;

  // Declare state variables for user details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /* This useEffect hook is responsible for fetching user data 
     from the server and updating the component state accordingly. 
     It runs when the component mounts or when the values in the 
     dependency array change. */
  useEffect(
    () => {
      // Define an async function called "fetchData" in the effect
      // to fetch the required data
      const fetchData = async () => {
        // Dispatch a FETCH_REQUEST action to set loading state.
        dispatch({ type: "FETCH_REQUEST" });
        try {
          /* Make an async API call to get the data for a 
             specific productId passed as props.    */
          const { data } = await Axios.get(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });

          //If the request is successful
          // Set various state variables with the fetched data
          setName(data.name);
          setEmail(data.email);
          setIsSeller(data.isSeller);
          setIsAdmin(data.isAdmin);

          // // Dispatch a FETCH_SUCCESS action
          dispatch({ type: "FETCH_SUCCESS" });
          // if there is any error while fetching the data.
        } catch (error) {
          dispatch({
            // Dispatch a FETCH_FAIL action to set error state
            type: "FETCH_FAIL",
            payload: getError(error), // Use a helper function to get the error message
          });
        }
      };
      fetchData();
    },
    /* It runs when the component mounts or when 
     the values in the dependency array change  */
    [dispatch, userId, userInfo] // dependency array
  );

  // function that handles a form submission event
  const submitHandler = async (e) => {
    // prevents the default form submission
    e.preventDefault();

    /* dispatches an action of type "UPDATE_REQUEST" 
       using a dispatch function provided by a Redux store. */
    dispatch({ type: "UPDATE_REQUEST" });

    try {
      // send a PUT request to update a user in a backend API
      await Axios.put(
        `/api/users/${userId}`,
        // properties of the user
        { _id: userId, name, email, isSeller, isAdmin },
        // authorization token
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      /* If the PUT request is successful  */
      /* dispatches an action of type "UPDATE_SUCCESS" */
      dispatch({
        type: "UPDATE_SUCCESS",
      });

      // displays a success toast message.
      toast.success("User updated successfully");

      // navigates to the '/userlist' page
      navigate("/userlist");
    } catch (error) {
      /* If the PUT request fails */

      /* displays an error toast message */
      toast.error(getError(error));

      /* dispatches an action of type "UPDATE_FAIL" */
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  return (
    <div className='grid  md:grid-cols-4 md:gap-5'>
      <Helmet>
        <title>Edit User {userId}</title>
      </Helmet>
      <div>
        <ul>
          <li>
            <Link to='/dashboard'>Dashboard</Link>
          </li>
          <li>
            <Link to='/orders'>Orders</Link>
          </li>
          <li>
            <Link to='/productlist'>Products</Link>
          </li>
          <li>
            <Link to='/users'>Users</Link>
          </li>
        </ul>
      </div>
      <div className='md:col-span-3'>
        <h1 className='mb-4 text-xl'>Edit User {userId}</h1>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
            <div className='mb-4' controlId='name'>
              <label>Name</label>
              <input
                className='w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='email'>
              <label>Email</label>
              <input
                type='email'
                className='w-full'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='email'>
              <label>Email</label>
              <input
                type='email'
                className='w-full'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='mb-4'>
              <input
                className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                type='checkbox'
                id='isAdmin'
                label='isAdmin'
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />{" "}
              <label>is Admin</label>
            </div>

            <div className='mb-4'>
              <input
                className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                type='checkbox'
                id='isSeller'
                label='isSeller'
                checked={isSeller}
                onChange={(e) => setIsSeller(e.target.checked)}
              />{" "}
              <label>is Seller</label>
            </div>

            <div className='mb-4'>
              <button
                type='submit'
                disabled={loadingUpdate}
                className='primary-button'
              >
                Update
              </button>
            </div>

            {loadingUpdate && <LoadingBox></LoadingBox>}
          </form>
        )}
      </div>
    </div>
  );
};

export default UserEditScreen;
