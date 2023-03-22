import Axios from "axios";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useNavigate, useParams } from "react-router-dom";
import React, { useContext, useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";

// A reducer function takes in two parameters, state and action,
// and returns a new state based on the provided action.
function reducer(state, action) {
  // handle different types of actions.
  switch (action.type) {
    case "FETCH_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: true, // sets the loading flag to true
        error: "", // empty string
      };
    case "FETCH_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        order: action.payload, // sets the order property based on the payload data
        error: "", // empty string
      };
    case "FETCH_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loading: false, // sets the loading flag to false
        error: action.payload, // sets the error value based on the payload data
      };
    case "PAY_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingPay: true, // sets the loadingPay flag to true
      };
    case "PAY_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingPay: false, // sets the loadingPay flag to false
        successPay: true, // sets the successPay flag to true
      };
    case "PAY_FAIL":
      return {
        ...state, // creating a copy of the current state
        loadingPay: false, // sets the loadingPay flag to flase
        errorPay: action.payload, // sets the errorPay value based on the payload data
      };
    case "PAY_RESET":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingPay: false, // sets the loadingPay flag to false
        successPay: false, // sets the successPay flag to false
        errorPay: "", // empty string
      };
    case "DELIVER_REQUEST":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDeliver: true, // sets the loadingDeliver flag to false
      };
    case "DELIVER_SUCCESS":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDeliver: false, // sets the loadingDeliver flag to false
        successDeliver: true, // sets the successDeliver flag to false
      };
    case "DELIVER_FAIL":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDeliver: false, // sets the loadingDeliver flag to false
        errorDeliver: action.payload, // sets the errorDeliver based on payload data
      };
    case "DELIVER_RESET":
      //  Returns a new state object
      return {
        ...state, // creating a copy of the current state
        loadingDeliver: false, // sets the loadingDeliver flag to false
        successDeliver: false, // sets the successDeliver flag to false
        errorDeliver: "", // empty string
      };
    // The default statement returns the current state.
    default:
      return state;
  }
}
const OrderScreen = () => {
  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // Destructuring userInfo from the state object
  const { userInfo } = state;

  // extract parameters from the URL
  const params = useParams();

  // // navigate between pages
  const navigate = useNavigate();

  // Destructuring orderId from the params object
  const { id: orderId } = params;

  // Importing usePayPalScriptReducer hook to handle PayPal script loading and error states
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // destructuring the state and dispatch from useReducer hook
  // initializing the state with loading set to true, order to an empty object and error to an empty string
  const [
    { loading, error, order, successPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
  });

  // useEffect hook that contains several state updates and asynchronous function calls
  useEffect(
    // executes whenever one of the values inside the dependency array (the second argument) changes.
    () => {
      //checks userInfo
      if (!userInfo) {
        // redirect the user to the login page
        return navigate("/login");
      }

      const fetchOrder = async () => {
        try {
          // indicate that data fetching has started
          dispatch({ type: "FETCH_REQUEST" });

          // sends a GET request to the endpoint /api/orders/${orderId},
          const { data } = await Axios.get(`/api/orders/${orderId}`, {
            // requires an authentication token provided in the headers object.
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          // a "FETCH_SUCCESS" action is dispatched with the payload containing the order data
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (err) {
          //  If an error occurs during the fetch request
          // dispatches a "FETCH_FAIL" action with an additional payload containing the error message
          dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        }
      };
      // check condiction
      if (
        !order._id ||
        successPay ||
        successDeliver ||
        (order._id && order._id !== orderId)
      ) {
        // calls the fetchOrder function.
        fetchOrder();

        // if successPay is true
        if (successPay) {
          // dispatches a "PAY_RESET" action
          dispatch({ type: "PAY_RESET" });
        }

        // if successPay is true
        if (successDeliver) {
          // dispatches a "DELIVER_RESET" action
          dispatch({ type: "DELIVER_RESET" });
        }
      } else {
        // This function loads the PayPal script and sets the necessary options.
        const loadPaypalScript = async () => {
          /* Makes a GET request to get the PayPal client ID from the 
             server using the logged in user's token for authorization.*/
          const { data: clientId } = await Axios.get("/api/keys/paypal", {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });

          /* Dispatches an action to reset the PayPal options 
              with the new client ID and currency.*/
          paypalDispatch({
            type: "resetOptions",
            value: {
              "client-id": clientId,
              currency: "EUR",
            },
          });
          // Dispatches an action to set the loading status to 'pending'.
          paypalDispatch({ type: "setLoadingStatus", value: "pending" });
        };
        // Calls the 'loadPaypalScript' function to execute the code inside.
        loadPaypalScript();
      }
    },
    // dependency array
    [
      order,
      successPay,
      successDeliver,
      userInfo,
      orderId,
      navigate,
      paypalDispatch,
    ]
  );

  // This function creates an order based on the data and actions passed in.
  // It returns a promise with the order ID when the order is successfully created.
  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice }, // set the amount to the total price of the order
          },
        ],
      })
      .then((orderID) => {
        return orderID; // resolve the promise with the order ID
      });
  }

  // Function to handle the approval of an order
  function onApprove(data, actions) {
    // Capture the order details
    return actions.order.capture().then(async function (details) {
      try {
        // Dispatch a request action for payment
        dispatch({ type: "PAY_REQUEST" });
        // Make a PUT request to update the order status
        const { data } = await Axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        // Dispatch success action with returned data
        dispatch({ type: "PAY_SUCCESS", payload: data });

        // Display success message
        toast.success("Order is paid");
      } catch (err) {
        // Dispatch fail action with error message
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        // Display error message
        toast.error(getError(err));
      }
    });
  }

  //This function handles errors by displaying a toast with the error message
  function onError(err) {
    //Display an error toast with the error message
    toast.error(getError(err));
  }

  //async function to deliver an order
  async function deliverOrderHandler() {
    //scroll to the top of the page
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    try {
      //dispatch a DELIVER_REQUEST action
      dispatch({ type: "DELIVER_REQUEST" });
      //make a PUT request to update the order status
      const { data } = await Axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      //dispatch a DELIVER_SUCCESS action with the response data
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      //display a success toast for successful order delivery
      toast.success("Order is delivered");
    } catch (err) {
      //dispatch a DELIVER_FAIL action with the error message
      dispatch({ type: "DELIVER_FAIL", payload: getError(err) });
      //display an error toast with the error message
      toast.error(getError(err));
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className='mb-4 text-xl'>Order {orderId}</h1>
      <div className='grid md:grid-cols-4 md:gap-5'>
        <div className='overflow-x-auto md:col-span-3'>
          <div className='card  p-5'>
            <div className='mb-2 text-lg'>Shipping</div>
            <div>
              <strong>Name:</strong> {order.shippingAddress.fullName} <br />
              <strong>Address: </strong> {order.shippingAddress.address},
              {order.shippingAddress.city}, {order.shippingAddress.postalCode},
              {order.shippingAddress.country}
            </div>
            {order.isDelivered ? (
              <MessageBox variant='success'>
                Delivered at {order.deliveredAt}
              </MessageBox>
            ) : (
              <MessageBox variant='danger'>Not Delivered</MessageBox>
            )}
          </div>
          <div className='card p-5'>
            <div className='mb-2 text-lg'>Payment</div>
            <div>
              <strong>Method:</strong> {order.paymentMethod}
            </div>
            {order.isPaid ? (
              <MessageBox variant='success'>Paid at {order.paidAt}</MessageBox>
            ) : (
              <MessageBox variant='danger'>Not Paid</MessageBox>
            )}
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
                {order.orderItems.map((item) => (
                  <tr key={item._id} className='border-b'>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className='img-fluid rounded img-thumbnail'
                      ></img>{" "}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
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
          </div>
        </div>
        <div md={4}>
          <div className='card  p-5'>
            <div>
              <h2 className='mb-2 text-lg'>Order Summary</h2>
              <ul>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Items</div>
                    <div>{order.itemsPrice.toFixed(2)} €</div>
                  </div>
                </li>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Shipping</div>
                    <div>{order.shippingPrice.toFixed(2)} €</div>
                  </div>
                </li>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>Tax</div>
                    <div>{order.taxPrice.toFixed(2)} €</div>
                  </div>
                </li>
                <li>
                  <div className='mb-2 flex justify-between'>
                    <div>
                      <strong> Order Total</strong>
                    </div>
                    <div>
                      <strong>{order.totalPrice.toFixed(2)} €</strong>
                    </div>
                  </div>
                </li>
                {!order.isPaid && (
                  <div>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div className='w-full'>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                  </div>
                )}

                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <li>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className='d-grid'>
                      <button
                        className='primary-button w-full'
                        type='button'
                        onClick={deliverOrderHandler}
                      >
                        Deliver Order
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
