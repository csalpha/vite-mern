import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";

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
        products: action.payload.products, // sets the products value based on the payload data
        page: action.payload.page, // sets the page value based on the payload data
        pages: action.payload.pages, // sets the pages value based on the payload data
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
        loadingCreate: true, // sets the loading flag to true
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
        loadingDelete: false, // sets the loadingDelete flag to false
      };
    // The default statement
    default:
      // returns the current state
      return state;
  }
};

const ProductListScreen = () => {
  // destructuring the state and dispatch from useReducer hook
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingDelete,
      loadingCreate,
      successDelete,
    },
    dispatch,
  ] = useReducer(
    reducer, // reducer function
    {
      loading: true, // sets loading flag to true
      error: "", // sets error to an empty string
    } // initial state
  );

  // The useNavigate hook allows for programmatic navigation.
  const navigate = useNavigate();

  // provides access to the current URL's search parameters and pathname.
  const { search, pathname } = useLocation();

  // checks if the current pathname contains the string "/seller".
  const sellerMode = pathname.indexOf("/seller") >= 0;

  // parse out any search parameters passed in through the URL
  const sp = new URLSearchParams(search);

  // get the value of the "page" parameter in the search parameters.
  const page = sp.get("page") || 1; // If it doesn't exist, we default to page 1.

  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // fetch data from an API when the component mounts and every time its dependencies change
  useEffect(() => {
    const fetchData = async () => {
      //  dispatch a FETCH_REQUEST action to set loading state
      dispatch({ type: "FETCH_REQUEST" });
      try {
        // make a GET request for products with page number and seller mode as query parameters
        const { data } = await Axios.get(
          `/api/products/admin?page=${page}&sellerMode=${sellerMode}`,
          {
            // bearer token authorization header
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        // If successful, we dispatch a FETCH_SUCCESS action with fetched data.
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          // If there is an error, we dispatch a FETCH_FAIL action with the error message.
          payload: getError(error),
        });
      }
    };
    // call the fetchData function to initiate the fetch
    fetchData();

    // The effect re-runs if any of these change.
  }, [dispatch, page, sellerMode, successDelete, userInfo]); // dependency array

  // This function takes in a product object as a parameter
  const deleteHandler = async (product) => {
    // Display a confirmation message for the user before proceeding
    if (window.confirm("Are you sure to delete?")) {
      // Dispatch action indicating that the deletion process has started
      dispatch({ type: "DELETE_REQUEST" });
      try {
        // Send a DELETE request to the backend API to delete the product
        await Axios.delete(`/api/products/${product._id}`, {
          // Attach authorization token to the request headers
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Display a success message to the user
        toast.success("product deleted successfully");
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

  // This function creates a product and dispatches an action based on the response
  const createHandler = async () => {
    // Prompt user to confirm creation of product
    if (window.confirm("Are you sure to create?")) {
      // Dispatch action to indicate request is being made
      dispatch({ type: "CREATE_REQUEST" });
      try {
        // Make post request to API with authorization header
        const {
          data: { product },
        } = await Axios.post(
          `/api/products`,
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        // Notify user that product was created successfully
        toast.success("product created successfully");

        // Dispatch action to indicate success
        dispatch({ type: "CREATE_SUCCESS" });

        // Navigate to edit page for newly created product
        navigate(`/product/${product._id}/edit`);

        // If there is an error
      } catch (error) {
        // Notify user of error
        toast.error(getError(error));
        // Dispatch action to indicate failure
        dispatch({
          type: "CREATE_FAIL",
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
            <Link to='/orders'>Orders</Link>
          </li>
          <li>
            <Link to='/productlist'>
              <a className='font-bold'>Products</a>
            </Link>
          </li>
          <li>
            <Link to='/users'>Users</Link>
          </li>
        </ul>
      </div>

      <div className='row'>
        <Helmet>
          <title>Products</title>
        </Helmet>
        <div className='md:col-span-3'>
          <h1 className='mb-4 text-xl'>Admin Dashboard</h1>
        </div>
        <div className='col-span-3 text-end'>
          <div>
            <button
              className='primary-button'
              type='button'
              onClick={createHandler}
            >
              Create Product
            </button>
          </div>
        </div>
      </div>

      {loadingDelete && <LoadingBox></LoadingBox>}
      {loadingCreate && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <>
          <div id='container' className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='border-b'>
                <tr>
                  <th className='px-5 text-left'>ID</th>
                  <th className='p-5 text-left'>NAME</th>
                  <th className='p-5 text-left'>PRICE</th>
                  <th className='p-5 text-left'>CATEGORY</th>
                  <th className='p-5 text-left'>BRAND</th>
                  <th className='p-5 text-left'>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className='border-b'>
                    <td className=' p-5 '>{product._id.substring(20, 24)}</td>
                    <td className=' p-5 '>{product.name}</td>
                    <td className=' p-5 '>{product.price}</td>
                    <td className=' p-5 '>{product.category}</td>
                    <td className=' p-5 '>{product.brand}</td>
                    <td className=' p-5 '>
                      <button
                        className='default-button'
                        type='button'
                        variant='light'
                        onClick={() => navigate(`/product/${product._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className='default-button'
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(product)}
                      >
                        {" "}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? "btn text-bold" : "btn"}
                key={x + 1}
                to={`/productlist?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListScreen;
