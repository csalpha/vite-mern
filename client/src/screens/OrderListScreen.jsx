import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";

/* A reducer function takes in two parameters, state and action
   and returns a new state based on the provided action.       */
const reducer = (state, action) => {
  // handle different types of actions
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
        orders: action.payload, // sets the orders value based on the payload data
        loading: false, // sets the loading flag to false
      };
    case "FETCH_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        error: action.payload, // sets the error value based on the payload data
      };
    case "CREATE_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreate: true, // sets the loadingCreate flag to true
      };
    case "CREATE_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreate: false, // sets the loadingCreate flag to false
      };
    case "CREATE_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreate: false, // sets the loadingCreate flag to false
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
        loadingDelete: false, // sets the loading flag to false
      };
    // The default statement
    default:
      // returns the current state
      return state;
  }
};

// Create a functional component called OrderListScreen
const OrderListScreen = () => {
  // provides access to the current pathname.
  const { pathname } = useLocation();

  // checks if the current pathname contains the string "/seller".
  const sellerMode = pathname.indexOf("/seller") >= 0;

  // destructuring the state and dispatch from useReducer hook
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(
      reducer, // reducer function
      {
        loading: true, // sets loading flag to true
        error: "", // sets error to an empty string
      } // initial state
    );

  // navigate between pages
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
          // make a GET request for orders with seller mode as query parameter
          const { data } = await Axios.get(
            `/api/orders?sellerMode=${sellerMode}`,
            // Attach authorization token to the request headers
            {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            }
          );
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
    [dispatch, sellerMode, successDelete, userInfo] // depencecy array
  );

  // This function takes in a order object as a parameter
  const deleteHandler = async (order) => {
    // Display a confirmation message for the user before proceeding
    if (window.confirm("Are you sure to delete?")) {
      // Dispatch action indicating that the deletion process has started
      dispatch({ type: "DELETE_REQUEST" });
      try {
        // Send a DELETE request to the backend API to delete the order
        await Axios.delete(`/api/orders/${order._id}`, {
          // Attach authorization token to the request headers
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Display a success message to the user
        toast.success("order deleted successfully");
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
    <div>
      <Helmet>
        <title>Orders List</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='border-b'>
              <tr>
                <th className='px-5 text-left'>ID</th>
                <th className='p-5 text-left'>DATE</th>
                <th className='p-5 text-left'>TOTAL</th>
                <th className='p-5 text-left'>PAID</th>
                <th className='p-5 text-left'>DELIVERED</th>
                <th className='p-5 text-left'>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className=' p-5 '>{order._id.substring(20, 24)}</td>
                  <td className=' p-5 '>
                    {order.user ? order.user.name : "DELETED USER"}
                  </td>
                  <td className=' p-5 '>{order.createdAt.substring(0, 10)}</td>
                  <td className=' p-5 '>{order.totalPrice.toFixed(2)}</td>
                  <td className=' p-5 '>
                    {order.isPaid ? order.paidAt.substring(0, 10) : "No"}
                  </td>
                  <td className=' p-5 '>
                    {order.isDelivered
                      ? order.deliveredAt.substring(0, 10)
                      : "No"}
                  </td>
                  <td className=' p-5 '>
                    <button
                      type='button'
                      variant='light'
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </button>
                    &nbsp;
                    <button
                      type='button'
                      variant='light'
                      onClick={() => deleteHandler(order)}
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

export default OrderListScreen;
