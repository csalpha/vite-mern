import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";

const PaymentMethodScreen = () => {
  // navigation between pages
  const navigate = useNavigate();

  // access the global store and getting state and dispatch method
  const { state, dispatch: ctxDispatch } = useContext(Store);

  // destructuring state object to get 'shippingAddress' and 'paymentMethod' from cart key
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  // if there's no shipping address associated with this cart
  if (!shippingAddress.address) {
    // navigate the user to ShippingScreen
    navigate("/shipping");
  }

  /* defining a state variable named 'paymentMethodName', initiazlied with the existing paymentMethod or default ("Paypal"), 
  Also creating a function 'setPaymentMethod' to update the value of 'paymentMethodName' */
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || "PayPal"
  );

  const submitHandler = (e) => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0; // scrolling to top of document
    e.preventDefault(); // preventing the default form submission behavior
    /* calling dispatch with action object 'SAVE_PAYMENT_METHOD'
     along with argument 'paymentMethodName' through context provider */
    ctxDispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethodName });
    // saving 'paymentMethodName' in local storage
    localStorage.setItem("paymentMethod", paymentMethodName);
    navigate("/placeorder"); // navigating the user to PlaceOrderScreen
  };
  return (
    <div>
      {" "}
      <div className='container small-container'>
        <Helmet>
          <title>Payment Method</title>
        </Helmet>

        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
          <h1 className='my-3'>Payment Method</h1>
          <div className='mb-4'>
            <input
              type='radio'
              id='PayPal'
              label='PayPal'
              value='PayPal'
              checked={paymentMethodName === "PayPal"} // condition to check whether radio button is selected or not
              onChange={(e) => setPaymentMethod(e.target.value)} // function triggered whenever any change occurs
            />
            <label className='p-2'>PayPal</label>
          </div>
          <div className='mb-4'>
            <input
              type='radio'
              id='Stripe'
              label='Stripe'
              value='Stripe'
              checked={paymentMethodName === "Stripe"} // condition to check whether radio button is selected or not
              onChange={(e) => setPaymentMethod(e.target.value)} // function triggered whenever any change occurs
            />
            <label className='p-2'>Stripe</label>
          </div>
          <div className='mb-4'>
            <input
              type='radio'
              id='CashOnDelivery'
              label='CashOnDelivery'
              value='CashOnDelivery'
              checked={paymentMethodName === "CashOnDelivery"} // condition to check whether radio button is selected or not
              onChange={(e) => setPaymentMethod(e.target.value)} // function triggered whenever any change occurs
            />
            <label className='p-2'>CashOnDelivery</label>
          </div>
          <div className='mb-3'>
            <button className='primary-button' type=''>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodScreen;
