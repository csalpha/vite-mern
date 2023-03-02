import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import Rating from "../components/Rating";

// { } []

const reducer = (state, action) => {
  // The reducer function depending on the action type
  switch (action.type) {
    case "REFRESH_PRODUCT":
      // Refreshing product in the state
      return { ...state, product: action.payload };
    case "FETCH_REQUEST":
      // Fetching product and setting loading to true
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      // Fetch success, update product and set loading to false
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      // Fetch failed, set loading to false and pass an error message
      return { ...state, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      // Create request, set loadingCreateReview to true
      return { ...state, loadingCreateReview: true };
    case "CREATE_SUCCESS":
      // Create success, set loadingCreateReview to false
      return { ...state, loadingCreateReview: false };
    case "CREATE_FAIL":
      // Create fail, set loadingCreateReview to false
      return { ...state, loadingCreateReview: false };
    default:
      // Default state
      return state;
  }
};

const ProductScreen = () => {
  //useRef() is used to store a reference to the reviews element
  let reviewsRef = useRef();

  //useContext() retrieves the Store context object and destructure the state object from it
  const { state, dispatch: ctxDispatch } = useContext(Store);

  //Destructure cart and userInfo data from state object
  const { cart, userInfo } = state;

  //useReducer() returns an array with loading, error and product properties and the dispatch function
  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  //useNavigate() is used to navigate to different routes in the application
  const navigate = useNavigate();

  //useParams is used to get route parameters like id/slug
  const params = useParams();
  const { id: slug } = params;

  //useState() is used to get access to rating, comment and selectedImage states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  // useEffect hook to handle side effects on component mount
  useEffect(() => {
    // create helper function fetchData that will do the api calls
    const fetchData = async () => {
      // sending FETCH_REQUEST action
      dispatch({ type: "FETCH_REQUEST" });
      try {
        // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/users/top-sellers"
        const { data } = await Axios.get(`/api/products/slug/${slug}`);
        // sending FETCH_SUCCESS action with retrieved payload
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        //sending FETCH_FAIL action if failed
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    // invoke fetchData when dependencies change (i.e. dispatch, slug)
    fetchData();
  }, [dispatch, slug]);

  // This function adds products to the cart
  const addToCartHandler = async () => {
    // Scroll to the top of the page
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Check if product has already been added to the cart
    const existItem = cart.cartItems.find((x) => x._id === product._id);

    // Set quantity variable depending on whether the product is already in the cart
    const quantity = existItem ? existItem.quantity + 1 : 1;

    // Get data from API
    const { data } = await Axios.get(`/api/products/${product._id}`);

    // Error checking: alert user and return if there are not enough products in stock
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }

    // Add item to the cart and navigate to the cart page
    ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    navigate("/cart");
  };

  console.log(product);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <div className='py-2'>
        <Link to='/'>back to products</Link>
      </div>
      <div className='grid md:grid-cols-4 md:gap-3'>
        <div className='md:col-span-2'>
          <img
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout='responsive'
          ></img>
        </div>
        <div>
          <ul>
            <li>
              <h1 className='text-lg'>{product.name}</h1>
            </li>
            <li>Category: {product.category}</li>
            <li>Brand: {product.brand}</li>
            <li>
              {product.rating} of {product.numReviews} reviews
            </li>
            <li>Description: {product.description}</li>
          </ul>
        </div>
        <div>
          <div className='card p-5'>
            <div className='mb-2 flex justify-between'>
              <div>Price</div>
              <div>{product.price} €</div>
            </div>
            <div className='mb-2 flex justify-between'>
              <div>Status</div>
              <div>
                {product.countInStock > 0 ? (
                  <span className='bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900'>
                    In Stock
                  </span>
                ) : (
                  <span className='bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900'>
                    Unavailable
                  </span>
                )}
              </div>
            </div>
            <button
              className='primary-button w-full'
              onClick={addToCartHandler}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div className='my-3'>
        <h2 ref={reviewsRef}>Reviews</h2>

        <div className='mb-3'>
          {product.reviews.length === 0 && (
            <MessageBox>There is no review</MessageBox>
          )}
        </div>
        <ul>
          {product.reviews.map((review) => (
            <li key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=' '></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
        <div className='my-3'>
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>

              <div className='mb-3' controlId='rating'>
                <div>Rating</div>
                <select
                  aria-label='Rating'
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value=''>Select...</option>
                  <option value='1'>1- Poor</option>
                  <option value='2'>2- Fair</option>
                  <option value='3'>3- Good</option>
                  <option value='4'>4- Very good</option>
                  <option value='5'>5- Excelent</option>
                </select>
              </div>

              <div
                controlId='floatingTextarea'
                label='Comments'
                className='mb-3'
              >
                <form
                  as='textarea'
                  placeholder='Leave a comment here'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className='mb-3'>
                <Button disabled={loadingCreateReview} type='submit'>
                  Submit
                </Button>

                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Please <Link to='/signin'>Sign In</Link> to write a review
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;
