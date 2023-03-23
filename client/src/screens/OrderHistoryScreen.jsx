import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
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
    // The default statement
    default:
      // returns the current state
      return state;
  }
};

const OrderHistoryScreen = () => {
  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // navigate between pages
  const navigate = useNavigate();

  // destructuring the state  and dispatch from useReducer hook
  const [{ loading, error, orders }, dispatch] = useReducer(
    reducer, // reducer
    {
      loading: true, // sets loading flag to true
      error: "", // sets error to an empty string
    }
  ); // initializing the state

  useEffect(
    () => {
      const fetchData = async () => {
        // dispatch an action of type FETCH_REQUEST
        dispatch({ type: "FETCH_REQUEST" });
        try {
          // make an API call using Axios
          const { data } = await Axios.get(
            `/api/orders/mine`,
            // pass the userInfo token as Authorization header
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );
          // dispatch an action of type FETCH_SUCCESS with the response data as payload
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (error) {
          // dispatch an action of type FETCH_FAIL with the error message as payload
          dispatch({
            type: "FETCH_FAIL",
            payload: getError(error),
          });
        }
      };
      //
      fetchData();
    },
    [userInfo] // depencecy array
    /* when there is a change in the userInfo 
  useEffect runs*/
  );

  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <h1 className='mb-4 text-xl'>Order History</h1>
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
                <tr key={order._id} className='border-b'>
                  <td className=' p-5 '>{order._id.substring(20, 24)}</td>
                  <td className=' p-5 '>{order.createdAt.substring(0, 10)}</td>
                  <td className=' p-5 '>{order.totalPrice.toFixed(2)}</td>
                  <td className=' p-5 '>
                    {order.isPaid ? order.paidAt.substring(0, 10) : "not paid"}
                  </td>
                  <td className=' p-5 '>
                    {order.isDelivered
                      ? order.deliveredAt.substring(0, 10)
                      : "not delivered"}
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

export default OrderHistoryScreen;
