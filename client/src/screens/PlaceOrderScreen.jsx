import Axios from "axios";
import React, { useContext, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";
import { Helmet } from "react-helmet-async";

// [] {}

// A reducer function takes in two parameters, state and action,
// and returns a new state based on the provided action.
const reducer = (state, action) => {
  // handle different types of actions.
  switch (action.type) {
    // When the action type is "REFRESH_PRODUCT
    case "REFRESH_PRODUCT":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        product: action.payload, // updates the product with the payload data
      };
    // When the action type is "FETCH_REQUEST
    case "FETCH_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: true, // sets the loading flag to true
      };
    // When the action type is "FETCH_SUCCESS
    case "FETCH_SUCCESS":
      return {
        ...state, // creating a copy of the current state
        product: action.payload, // sets the product based on the payload data
        loading: false, // sets the loading flag to false
      };
    // When the action type is "FETCH_FAIL
    case "FETCH_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        error: action.payload, // sets the error value based on the payload data
      };
    // When the action type is "CREATE_REQUEST
    case "CREATE_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreateReview: true, // sets the loadingCreateReview flag to true
      };
    // When the action type is "CREATE_SUCCESS
    case "CREATE_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreateReview: false, // sets the loadingCreateReview flag to false
      };
    // When the action type is "CREATE_FAIL
    case "CREATE_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingCreateReview: false, // sets the loadingCreateReview flag to false
      };
    // The default statement returns the current state.
    default:
      return state;
  }
};

const PlaceOrderScreen = () => {
  // sets up a navigation component
  const navigate = useNavigate();

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  // Retrieves state and dispatch functions from context
  const { state, dispatch: ctxDispatch } = useContext(Store);

  // Destructures the cart and userInfo from the retrieved state
  const { cart, userInfo } = state;

  // destructures cartItems, shippingAdderss and paymentMethod from the the cart
  const { cartItems, shippingAddress, paymentMethod } = cart;

  // Checks to see if there is a paymentMethod key in the cart object. If not, navigates to '/payment'
  if (!cart.paymentMethod) {
    navigate("/payment");
  }

  // Rounds a number to 2 decimal places
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    // Calculates the total price of all items in cart
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  // Determines the shipping price based on whether the itemsPrice is greater than 100 or not
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  // Sets the taxPrice to zero
  cart.taxPrice = round2(0);
  // // Calculates the total cost of all items
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    // scroll to the top of the page when the function is called
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    try {
      // dispatches "CREATE_REQUEST" action
      dispatch({ type: "CREATE_REQUEST" });

      /* A success response from this API call returns a new object which is destructured 
         for only the data property before being assigned to a constant variable. */
      const { data } = await Axios.post(
        "/api/orders", // send a post request to "/api/orders"
        // with the order details passed as parameters
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      /* dispatch CART_CLEAR action to remove 
         all items in the cart. */
      ctxDispatch({ type: "CART_CLEAR" });
      /* The CREATE_SUCCESS action is dispatched after a successful order 
      placement indicating that the request has been fulfilled without errors. */
      dispatch({ type: "CREATE_SUCCESS" });

      //  the items in the cart will be removed once the order is successfully placed.
      localStorage.removeItem("cartItems");
      // the user is navigated to the /order/${data.order._id}.
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      // dispatch a CREATE_FAIL action
      dispatch({ type: "CREATE_FAIL" });
      // an error message is displayed
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h1 className='mb-4 text-xl'>Place Order</h1>
      {cartItems.lenght === 0 ? (
        <div>Your Cart is empty.</div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <div className='card  p-5'>
              <h2 className='mb-2 text-lg'>Shipping Address</h2>

              <div>
                {shippingAddress.fullName}, {shippingAddress.address},{" "}
                {shippingAddress.city}, {shippingAddress.postalCode},{" "}
                {shippingAddress.country}
                <div>
                  <Link to='/shipping'>Edit</Link>
                </div>
              </div>
            </div>
            <div className='card p-5'>
              <h2 className='mb-2 text-lg'>Payment Method</h2>
              <div>{paymentMethod}</div>
              <div>
                <Link to='/payment'>Edit</Link>
              </div>
            </div>
            <div className='card overflow-x-auto p-5'>
              <h2 className='mb-2 text-lg'>Order Items</h2>
              <table className='min-w-full'>
                <thead className='border-b'>
                  <tr>
                    <th className='px-5 text-left'>Item</th>
                    <th className='    p-5 text-right'>Quantity</th>
                    <th className='  p-5 text-right'>Price</th>
                    <th className='p-5 text-right'>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* render cartItems map each item in the cart to a table row*/}
                  {cartItems.map((item) => (
                    <tr key={item._id} className='border-b'>
                      <td>
                        <Link to={`/product/${item.slug}`}>
                          <a className='flex items-center'>
                            <img
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            ></img>{" "}
                            &nbsp;
                            {item.name}
                          </a>
                        </Link>
                      </td>

                      <td className=' p-5 text-right'>{item.quantity}</td>
                      <td className='p-5 text-right'>{item.price} €</td>
                      <td className='p-5 text-right'>
                        {item.quantity * item.price} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link to='/cart'>Edit</Link>
              </div>
            </div>
          </div>
          {/* Second column - action column in the palce order */}
          <div>
            <div className='card  p-5'>
              <h2 className='mb-2 text-lg'>Order Summary</h2>
              <ul>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Items</div>
                    <div> {cart.itemsPrice.toFixed(2)} € </div>
                  </div>
                </li>

                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Shipping</div>
                    <div> {cart.shippingPrice.toFixed(2)} € </div>
                  </div>
                </li>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Tax</div>
                    <div>{cart.taxPrice.toFixed(2)} € </div>
                  </div>
                </li>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>
                      <strong> Order Total</strong>
                    </div>
                    <div>
                      <strong>€{cart.totalPrice.toFixed(2)}</strong>{" "}
                    </div>
                  </div>
                </li>
                <div className='d-grid'>
                  <button
                    className='primary-button w-full'
                    type='button'
                    onClick={placeOrderHandler}
                    disabled={cart.cartItems.length === 0}
                  >
                    Place Order
                  </button>
                </div>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrderScreen;
