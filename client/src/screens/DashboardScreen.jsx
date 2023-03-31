import React, { useContext, useEffect, useReducer } from "react";
import Chart from "react-google-charts";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Axios from "axios";
import { getError } from "../utils";
import { Store } from "../Store";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
        summary: action.payload, // sets the summary value based on the payload data
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

// Create a functional component called DashboardScreen
const DashboardScreen = () => {
  // destructuring the state and dispatch from useReducer hook
  const [{ loading, summary, error }, dispatch] = useReducer(
    reducer, // reducer
    {
      loading: true, // sets loading flag to true
      error: "", // sets error to an empty string
    }
  );

  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // using useEffect hook to fetch order summary data from an API endpoint
  useEffect(
    () => {
      // Define an asynchronous function called fetchData()
      const fetchData = async () => {
        // Dispatches a "FETCH_REQUEST" action to update the state to indicate that data fetching has started.
        dispatch({ type: "FETCH_REQUEST" });
        try {
          // Makes a GET request to the server with a bearer token authorization header to access sensitive user data.
          const { data } = await Axios.get(`/api/orders/summary`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          /* If the GET request is successful, then the data fetched will be 
        dispatched to the state through the "FETCH_SUCCESS" action type   */
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (error) {
          // If there is an error while making the GET request, then
          // an "FETCH_FAIL" action type will be dispatched to the state
          // and an error message will be returned for display. */
          dispatch({
            //"FETCH_FAIL" action type will be dispatched to the state
            type: "FETCH_FAIL",
            payload: getError(error),
          });
        }
      };
      // Call the fetchData function defined earlier.
      fetchData();
    },
    // Add dispatch and userInfo as dependencies to the useEffect hook
    // Whenever a dependency changes, this hook will rerun the code inside it.
    [dispatch, userInfo]
  );

  return (
    //  [] {}
    <div className='grid  md:grid-cols-4 md:gap-5'>
      <div>
        <ul>
          <li>
            <Link to='/admin/dashboard'>
              <a className='font-bold'>Dashboard</a>
            </Link>
          </li>
          <li>
            <Link to='/admin/orders'>Orders</Link>
          </li>
          <li>
            <Link to='/productlist'>Products</Link>
          </li>
          <li>
            <Link to='/admin/users'>Users</Link>
          </li>
        </ul>
      </div>
      <div className='md:col-span-3'>
        <h1 className='mb-4 text-xl'>Admin Dashboard</h1>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant='danger'></MessageBox>
        ) : (
          <div>
            <div className='grid grid-cols-1 md:grid-cols-4'>
              <div className='my-3'>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.users[0].numUsers}</p>
                  <p className=''>Users</p>
                  <Link to='/admin/users'>View users</Link>
                </div>
              </div>

              <div className='my-3'>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </p>
                  <p className=''>Orders</p>
                  <Link to='/admin/orders'>View orders</Link>
                </div>
              </div>

              <div className='my-3'>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}{" "}
                    €
                  </p>
                  <p className=''>Sales</p>
                  <Link to='/admin/sales'>View sales</Link>
                </div>
              </div>
            </div>
            <div className='my-3'>
              <h2>Categories</h2>
              {summary.productCategories.length === 0 ? (
                <MessageBox>No Category</MessageBox>
              ) : (
                <div>
                  <Chart
                    width='100%'
                    height='400px'
                    chartType='PieChart'
                    loader={<div>Loading Chart</div>}
                    data={[
                      ["Category", "Products"],
                      ...summary.productCategories.map((x) => [x._id, x.count]),
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
