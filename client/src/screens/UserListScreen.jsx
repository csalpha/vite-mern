import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
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
        users: action.payload, // sets the users value based on the payload data
        loading: false, // sets the loading flag to false
      };
    case "FETCH_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        error: action.payload, // sets the error value based on the payload data
      };
    case "DELETE_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDelete: true, // sets the loadingDelete flag to true
        successDelete: false, // sets the successDelete flag to false
      };
    case "DELETE_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDelete: false, // sets the loadingDelete flag to false
        successDelete: true, // sets the successDelete flag to true
      };
    case "DELETE_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDelete: false, // sets the loadingDelete flag to false
      };
    default:
      // returns the current state
      return state;
  }
};

// Create a functional component called UserListScreen
const UserListScreen = () => {
  // destructuring the state and dispatch from useReducer hook
  const [
    { loading, error, users, loadingDelete, successDelete }, // state object
    dispatch, // dispatch
  ] = useReducer(
    reducer, // reducer function
    {
      loading: true, // sets loading flag to true
      error: "", // sets error to an empty string
    } // initial state object
  );

  // The useNavigate hook allows for programmatic navigation
  // between different routes in a React application.
  const navigate = useNavigate();

  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // fetch data from an API when the component mounts and every time its dependencies change
  useEffect(
    () => {
      const fetchData = async () => {
        //  dispatch a FETCH_REQUEST action to set loading state
        dispatch({ type: "FETCH_REQUEST" });
        try {
          // make a GET request for users
          const { data } = await Axios.get(`/api/users`, {
            // Attach authorization token to the request headers
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          // If successful, we dispatch a FETCH_SUCCESS action with fetched data.
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (error) {
          // If there is an error, we dispatch a FETCH_FAIL action with the error message.
          dispatch({
            type: "FETCH_FAIL",
            payload: getError(error),
          });
        }
      };
      // call the fetchData function to initiate the fetch
      fetchData();
    },
    // The effect re-runs if any of these change.
    [userInfo, successDelete] // // dependency array
  );

  // This function takes in a user object as a parameter
  const deleteHandler = async (user) => {
    // Display a confirmation message for the user before proceeding
    if (window.confirm("Are you sure to delete?")) {
      // Dispatch action indicating that the deletion process has started
      dispatch({ type: "DELETE_REQUEST" });

      try {
        // Send a DELETE request to the backend API to delete the user
        await Axios.delete(`/api/users/${user._id}`, {
          // Attach authorization token to the request headers
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Display a success message to the user
        toast.success("user deleted successfully");
        // Dispatch action indicating that the deletion process was successful
        dispatch({ type: "DELETE_SUCCESS" });
        // If there is an error
      } catch (error) {
        // display an error message to the user
        toast.error(getError(error));
        // Dispatch an action indicating that the deletion process failed
        dispatch({
          type: "DELETE_FAIL",
        });
      }
    }
  };

  return (
    <div className='grid  md:grid-cols-auto md:gap-5'>
      <div>
        <ul>
          <li>
            <Link to='/dashboard'>Dashboard</Link>
          </li>
          <li>
            <Link to='/orderhistory'>Orders</Link>
          </li>
          <li>
            <Link to='/productlist'>Products</Link>
          </li>
          <li>
            <Link to='/userlist'>
              <a className='font-bold'>Users</a>
            </Link>
          </li>
        </ul>
      </div>

      <div className='row'>
        <Helmet>
          <title>Users</title>
        </Helmet>
        <div className='md:col-span-3'>
          <h1 className='mb-4 text-xl'>Users</h1>
        </div>
        <div className='col-span-3 text-end'></div>
      </div>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <div id='container' className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='border-b'>
              <tr>
                <th className='p-5 text-left'>ID</th>
                <th className='p-5 text-left'>NAME</th>
                <th className='p-5 text-left'>EMAIL</th>
                <th className='p-5 text-left'>IS SELLER</th>
                <th className='p-5 text-left'>IS ADMIN</th>
                <th className='p-5 text-left'>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className=' p-5 '>{user._id.substring(20, 24)}</td>
                  <td className=' p-5 '>{user.name}</td>
                  <td className=' p-5 '>{user.email}</td>
                  <td className=' p-5 '>{user.isSeller ? "YES" : " NO"}</td>
                  <td className=' p-5 '>{user.isAdmin ? "YES" : "NO"}</td>
                  <td className=' p-5 '>
                    <button
                      className='default-button'
                      type='button'
                      variant='light'
                      onClick={() => navigate(`/user/${user._id}/edit`)}
                    >
                      Edit
                    </button>
                    &nbsp;
                    <button
                      className='default-button'
                      type='button'
                      variant='light'
                      onClick={() => deleteHandler(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListScreen;
