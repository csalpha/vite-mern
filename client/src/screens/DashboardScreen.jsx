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

// [] {}

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return {
        ...state,
        loading: true,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

const DashboardScreen = () => {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  });

  const {
    state, // get state from useContext
  } = useContext(
    Store // pass parameter
  );

  const {
    userInfo, // get userInfo from state
  } = state;

  // define useEffect
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await Axios.get(`/api/orders/summary`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [dispatch, userInfo]);

  return (
    //  [] {}
    <div className='grid  md:grid-cols-4 md:gap-5'>
      <div>
        {/* create ul */}
        <ul>
          {/* first li */}
          <li>
            <Link to='/admin/dashboard'>
              <a className='font-bold'>Dashboard</a>
            </Link>
          </li>
          {/* second li */}
          <li>
            <Link to='/admin/orders'>Orders</Link>
          </li>
          {/* third li */}
          <li>
            <Link to='/admin/products'>Products</Link>
          </li>
          {/* fourth li */}
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
