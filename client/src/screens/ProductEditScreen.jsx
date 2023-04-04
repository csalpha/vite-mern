import React, { useContext, useEffect, useReducer, useState } from "react";
import Axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";

// A reducer function takes in two parameters, state and action,
// and returns a new state based on the provided action.
const reducer = (state, action) => {
  // handle different types of actions
  switch (action.type) {
    case "UPLOAD_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpload: true, // sets the loadingUpload flag to true
      };
    case "UPLOAD_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpload: false, // sets the loadingUpload flag to false
      };
    case "UPLOAD_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingUpload: false, // sets the loadingUpload flag to false
      };
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
    // The default statement
    default:
      // returns the current state
      return state;
  }
};

// Create a functional component called ProductEditScreen
const ProductEditScreen = () => {
  //  destructuring state object from Store Context
  const { state } = useContext(Store);
  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // destructuring the state and dispatch from useReducer hook
  const [{ loading, error, loadingUpload, loadingUpdate }, dispatch] =
    useReducer(
      reducer, // reducer function
      {
        loading: true, // sets loading flag to true
        error: "", // sets error to an empty string
      }
    );

  // navigate between pages
  const navigate = useNavigate();

  // extract parameters from the URL
  const params = useParams();

  // Destructuring productId from the params object
  const { id: productId } = params;

  // Declare state variables for product details
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  /* This code makes use of the useEffect hook to asynchronously fetch the required
     product data from the backend API whenever the productId or dispatch changes   */
  useEffect(
    () => {
      // Define an async function called "fetchData" in the effect to fetch the required data
      const fetchData = async () => {
        // Dispatch a FETCH_REQUEST action to set loading state.
        dispatch({ type: "FETCH_REQUEST" });
        try {
          // Make an API call to get the data
          // for a specific productId passed as props.
          const { data } = await Axios.get(`/api/products/${productId}`);
          // Set various state variables with the fetched data
          setName(data.name);
          setSlug(data.slug);
          setPrice(data.price);
          setImage(data.image);
          setImages(data.images);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setBrand(data.brand);
          setDescription(data.description);

          // Dispatch a FETCH_SUCCESS action
          dispatch({ type: "FETCH_SUCCESS" });
        } catch (error) {
          // if there is any error while fetching the data.
          dispatch({
            // Dispatch a FETCH_FAIL action to set error state
            type: "FETCH_FAIL",
            payload: getError(error), // Use a helper function to get the error message
          });
        }
      };
      // Call the fetchData function.
      fetchData();
    },
    // The effect re-runs whenever the productId or dispatch changes
    [dispatch, productId] // dependency array
  );

  // function that handles a form submission event
  const submitHandler = async (e) => {
    // prevents the default form submission
    e.preventDefault();

    /* dispatches an action of type "UPDATE_REQUEST" 
       using a dispatch function provided by a Redux store. */
    dispatch({ type: "UPDATE_REQUEST" });

    try {
      // send a PUT request to update a product in a backend API
      await Axios.put(
        `/api/products/${productId}`, // endpoint
        // request body
        {
          // properties of the product
          _id: productId,
          name,
          slug,
          price,
          image,
          images,
          category,
          brand,
          countInStock,
          description,
        },
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
      toast.success("Product updated successfully");

      // navigates to the '/productlist' page
      navigate("/productlist");
    } catch (error) {
      /* If the PUT request fails */

      /* displays an error toast  */
      toast.error(getError(error));

      /* dispatches an action of type "UPDATE_FAIL" */
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  /*handles the upload of a single file */
  const uploadFileHandler = async (
    e, // event
    forImages // uploaded file is a image or not?
  ) => {
    // extracts the file object from the event
    const file = e.target.files[0];

    // creates a new FormData object
    const bodyFormData = new FormData();

    bodyFormData.append("image", file);

    /* dispatches an action of type "UPLOAD_REQUEST" */
    dispatch({ type: "UPLOAD_REQUEST" });
    try {
      /* send a POST request to the '/api/uploads' endpoint of a backend API  */
      const { data } = await Axios.post(
        "/api/uploads", // endpoint
        bodyFormData, // image
        {
          headers: {
            "Content-Type": "multipart/form-data", // request body contains binary data
            Authorization: `Bearer ${userInfo.token}`, // authorization token
          },
        }
      );
      /* If the POST request is successful */

      /* If forImages is true */
      if (forImages) {
        // adds the file data to the images array using the setImages function
        setImages([...images, data]);
      } else {
        // sets the file data as the image state variable
        setImage(data);
      }

      /* displays a success toast message */
      toast.success("Image uploaded sucessfully. Click update to apply it.");

      /* dispatches an action of type "UPLOAD_SUCCESS" */
      dispatch({ type: "UPLOAD_SUCCESS" });
    } catch (error) {
      /* If the POST request fails */

      /*  displays an error toast message */
      toast.error(getError(error));

      /* dispatches an action of type "UPLOAD_FAIL" */
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  /* asynchronous function called deleteFileHandler
     that takes two parameters: fileName and f     */
  const deleteFileHandler = async (fileName, f) => {
    // logs fileName and f to the console
    console.log(fileName, f);

    //logs the current value of the images array
    console.log(images);

    // create a new array that excludes the fileName parameter
    console.log(images.filter((x) => x !== fileName));
    /* create a new array that excludes the fileName parameter, 
    and sets this new array as the new value for the images state */
    setImages(images.filter((x) => x !== fileName));

    /* displays a success toast message */
    toast.success("Image removed successfully. click Update to apply it");
  };

  return (
    <div className='grid  md:grid-cols-4 md:gap-5'>
      <Helmet>
        <title>Edit Product {productId}</title>
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
            <Link to='/productlist'>
              <a className='font-bold'>Products</a>
            </Link>
          </li>
          <li>
            <Link to='/users'>Users</Link>
          </li>
        </ul>
      </div>

      <div className='md:col-span-3'>
        <h1 className='mb-4 text-xl'>{`Edit Product ${productId}`}</h1>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
            <div className='mb-4'>
              <label htmlFor='name'>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='slug'>
              <label>Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='name'>
              <label>Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='image'>
              <label>Image File</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>

            <div className='mb-4' controlId='additionalImage'>
              <label>Additional Images</label>
              {images.length === 0 && <MessageBox>No image</MessageBox>}
              <ul variant='flush'>
                {images.map((x) => (
                  <li key={x}>
                    {x}
                    <button
                      variant='light'
                      onClick={() => deleteFileHandler(x)}
                    >
                      <i className='fa fa-times-circle'></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className='mb-4' controlId='additionalImageFile'>
              <label>Upload Aditional Image</label>
              <input type='file' onChange={(e) => uploadFileHandler(e, true)} />
              {loadingUpload && <LoadingBox></LoadingBox>}
            </div>

            <div className='mb-4' controlId='imageFile'>
              <label>Upload Image</label>
              <input type='file' onChange={uploadFileHandler} />
              {loadingUpload && <LoadingBox></LoadingBox>}
            </div>
            <div className='mb-4' controlId='category'>
              <label>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='brand'>
              <label>Brand</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='countInStock'>
              <label>Count In Stock</label>
              <input
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>
            <div className='mb-4' controlId='description'>
              <label>Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className='mb-4'>
              <button disabled={loadingUpdate} type='submit'>
                Update
              </button>
              {loadingUpdate && <LoadingBox></LoadingBox>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductEditScreen;
