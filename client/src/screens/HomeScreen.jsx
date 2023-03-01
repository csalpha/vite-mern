import React, { useState, useEffect, useReducer } from "react";
import axios from "axios";
import Product from "../components/Product";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils";

// {} []

/**

This reducer handles actions related to fetching products, sellers and failure-related cases.

@param {Object} state the current state of the application

@param {Object} action the action triggered

@return {Object} the modified state
*/

const reducer = (state, action) => {
  // uses a switch statement to handle different action types
  switch (action.type) {
    // Handles fetch request when initializing loading
    case "FETCH_REQUEST":
      return {
        ...state, // previous state
        loading: true,
      };
    // Handles success response from fetch with products and sellers
    // updates the products, sellers and loading keys in the state.
    case "FETCH_SUCCESS":
      return {
        ...state, // previous state
        products: action.payload.products,
        sellers: action.payload.sellers,
        loading: false,
      };
    // Handles failed response from fetch
    // updates the loading and error keys in the state.
    case "FETCH_FAIL":
      return {
        ...state, // previous state
        loading: false,
        error: action.payload,
      };
    // The default case returns the current state object when an unknown action type is dispatched.
    default:
      return state;
  }
};

const HomeScreen = () => {
  /*The dispatch function is used to update the state. 
  When called, it triggers the reducer function that takes 
  in the current state and an action object as its arguments, 
  and returns the new state */
  const [
    { loading, error, products, sellers }, // current state
    dispatch, // dispatch function
  ] = useReducer(reducer, {
    loading: true, // Set 'loading' to true at start
    error: "", // Initialize 'error' as an empty string
  });

  /* this code fetches data from a server using Axios library and dispatches 
  corresponding actions based on the success or failure of the requests */
  // Make two HTTP GET requests using Axios library to get products and sellers data
  useEffect(() => {
    // asynchronous function named fetchData.
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" }); // Dispatch a FETCH_REQUEST action before making the request
      try {
        // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/products/top-products"
        // The response data is destructured and stored in products variable.
        const { data: products } = await axios.get(
          "/api/products/top-products"
        );
        // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/users/top-sellers"
        // The response data is destructured and stored in sellers variable.
        const { data: sellers } = await axios.get("/api/users/top-sellers");
        dispatch({ type: "FETCH_SUCCESS", payload: { products, sellers } }); // Dispatch a FETCH_SUCCESS action if request was successful
      } catch (error) {
        dispatch({
          // Dispatch a FETCH_FAIL action if request failed
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };

    fetchData(); // Execute function that makes requests to the server
    // the effect only needs to be executed once when the component is mounted
  }, [dispatch]);

  return (
    <div>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox>{error}</MessageBox>
      ) : (
        <>
          <div className='py-2'>
            <h2 className=''>Top Sellers</h2>
          </div>
          <div className=''>
            <Carousel showArrows autoPlay showThumbs={false}>
              {sellers.map((seller) => (
                <div key={seller._id}>
                  <Link to={`/seller/${seller._id}`}>
                    <img src={seller.seller.logo} alt={seller.seller.name} />
                    <p className='legend'>{seller.seller.name}</p>
                  </Link>
                </div>
              ))}
            </Carousel>
          </div>
          <div className='py-2'>
            <h2 className=''>Top Products</h2>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {products.map((product) => (
              <div sm={6} lg={4} key={product._id} className='mb-3'>
                {/* Render a Product component for each product object */}
                <Product product={product}></Product>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
