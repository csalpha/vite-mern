import Axios from "axios";
import React, { useEffect, useReducer, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Product from "../components/Product";
import { getError, prices, ratings } from "../utils";
import { Helmet } from "react-helmet-async";
import Rating from "../components/Rating";

/* This reducer handles the fetch request, success, 
and fail actions for retrieving products from an API */

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      // Set loading to true when a fetch request is made
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      /* Update the state with the payload data
         when the request is successful */
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false, // Set loading to false
      };
    case "FETCH_FAIL":
      // Set loading to false and set the error when the request fails
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const SearchScreen = () => {
  /*  navigate between different pages */
  const navigate = useNavigate();

  // get the current location of the page
  const { search } = useLocation();

  // get the parameters from a URL
  const sp = new URLSearchParams(search);

  // Get the category, query, price, rating, order and page from the URL
  const category = sp.get("category") || "all";
  const query = sp.get("query") || "all";
  const price = sp.get("price") || "all";
  const rating = sp.get("rating") || "all";
  const order = sp.get("order") || "newest";
  const page = sp.get("page") || 1;

  // access the reducer and set the initial state
  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true, // Set the initial value of loading to true
      error: "", // Set the initial value of error to an empty string
    });

  useEffect(() => {
    // Create an async function to fetch data from the given API call
    const fetchData = async () => {
      // Dispatch an action to indicate that a request is being made
      dispatch({ type: "FETCH_REQUEST" });
      try {
        // Make an Axios GET request with all the relevant parameters
        const { data } = await Axios.get(
          `/api/products?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        // Dispatch an action with the fetched data as payload
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        // Dispatch an action with the error message as payload
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    // Call the fetchData function
    fetchData();
    // dependecies array
  }, [category, dispatch, price, query, order, rating, page]);

  // Declare a state variable called categories and a function to set its value
  const [categories, setCategories] = useState([]);

  /*  useEffect hook to call the fetchCategories 
      function when the component mounts */
  useEffect(() => {
    // async function to fetch categories from the API
    const fetchCategories = async () => {
      try {
        // get data from the API
        const { data } = await Axios.get(`/api/products/categories`);
        // set the categories in state
        setCategories(data);
      } catch (err) {
        // if there is an error display a toast message with the error
        toast.error(getError(err));
      }
    };
    // call the fetchCategories function
    fetchCategories();
  }, [dispatch]);

  // creates a filter URL based on the filter object passed in
  const getFilterUrl = (filter) => {
    // Set the page, category, query, rating, and price to the filter object or set it to the default values
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    // Return the filter URL with the parameters
    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>

      <div className='container m-auto mt-4 px-4'>
        <div className='py-2'>
          <Link to='/'>back to products</Link>
        </div>
        <div className='grid md:grid-cols-4 md:gap-3'>
          <h3>Department</h3>
          <div className=''>
            <ul>
              <li>
                <Link
                  className={"all" === category ? "text-bold" : ""}
                  to={getFilterUrl({ category: "all" })}
                >
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? "text-bold" : ""}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className=''>
            <h3>Price</h3>
            <ul>
              <li>
                <Link
                  className={"all" === price ? "text-bold" : ""}
                  to={getFilterUrl({ price: "all" })}
                >
                  Any
                </Link>
              </li>

              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={p.value === price ? "text-bold" : ""}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className=''>
            <h3>Avg. Customer Review</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={`${r.rating}` === `${rating}` ? "text-bold" : ""}
                  >
                    <Rating caption={" & up"} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: "all" })}
                  className={rating === "all" ? "text-bold" : ""}
                >
                  <Rating caption={" & up"} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant='danger'>{error}</MessageBox>
          ) : (
            <>
              <div className='grid md:grid-cols-4 md:gap-3'>
                <div>
                  {loading ? (
                    <LoadingBox></LoadingBox>
                  ) : error ? (
                    <MessageBox variant='danger'>{error}</MessageBox>
                  ) : (
                    <div className='container m-auto mt-4 px-4'>
                      {countProducts === 0 ? "No" : countProducts} Results
                      {query !== "all" && " : " + query}
                      {category !== "all" && " : " + category}
                      {price !== "all" && " : Price " + price}
                      {rating !== "all" && " : Rating " + rating + " & up"}
                      {query !== "all" ||
                      category !== "all" ||
                      rating !== "all" ||
                      price !== "all" ? (
                        <button
                          variant='light'
                          onClick={() => navigate("/search")}
                        >
                          <i className='fas fa-times-circle'></i>
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className='text-end'>
                  Sort by{" "}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value='newest'>Newest Arrivals</option>
                    <option value='lowest'>Price: Low to High</option>
                    <option value='highest'>Price: High to Low</option>
                    <option value='toprated'>Avg. Customer Reviews</option>
                  </select>
                </div>
              </div>

              {products.length === 0 && (
                <MessageBox>No Product Found</MessageBox>
              )}

              <div className='container m-auto mt-4 px-4'>
                {products.map((product) => (
                  <div
                    className='grid md:grid-cols-4 md:gap-3'
                    key={product._id}
                  >
                    <Product product={product}></Product>
                  </div>
                ))}
              </div>

              <div className='container m-auto mt-4 px-4'>
                {[...Array(pages).keys()].map((x) => (
                  <Link
                    key={x + 1}
                    className='mx-1'
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <button
                      className={Number(page) === x + 1 ? "text-bold" : ""}
                      variant='light'
                    >
                      {x + 1}
                    </button>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
