import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";

const ShippingAddressScreen = () => {
  // navigation without reloading the page
  const navigate = useNavigate();

  const {
    state, // It is the current state object obtained from the Store
    dispatch: ctxDispatch, // dispatch actions to update the state object held in Store
  } = useContext(Store);

  // extract addressMap, userInfo, and shippingAddress from the state object.
  const {
    addressMap,
    userInfo,
    cart: { shippingAddress },
  } = state;

  /*  declares a new state variable named lat, 
      assigns its initial state to the shippingAddress.lat 
      and a setLat function that will be used to update the state of the lat. */
  const [lat, setLat] = useState(shippingAddress.lat);

  /* declares a new state variable named lng, 
     assigns its initial state to the shippingAddress.lng 
     and a setLng function that will be used to update the state of the lng. */
  const [lng, setLng] = useState(shippingAddress.lng);

  if (!userInfo) {
    // redirect the user to the /signin page.
    navigate("/signin");
  }

  /* Initialize state variables with the values of 
  shippingAddress object or an empty string if undefined */
  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const submitHandler = (e) => {
    // Reset the scroll position of the body and document to the top
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Prevents the default behavior of form submission
    e.preventDefault();

    /* Checks if there are new coordinates from the map 
       or uses the old ones that were set by the user */
    const newLat = addressMap ? addressMap.lat : lat;
    const newLng = addressMap ? addressMap.lng : lng;

    if (addressMap) {
      setLat(addressMap.lat);
      setLng(addressMap.lng);
    }
    // Initializes a variable to determine whether it's okay to move forward with the submission.
    let moveOn = true;

    /* Checks whether the user has selected a location on the map. If they have not, 
    creates a popup confirming that they would like to continue without selecting a location. */
    if (!newLat || !newLng) {
      moveOn = window.confirm(
        "You did not set your location on map. Continue?"
      );
    }

    if (moveOn) {
      /* Dispatches an action to update the global store
         with the new shipping address information*/
      ctxDispatch({
        type: "SAVE_SHIPPING_ADDRESS",
        payload: {
          fullName,
          address,
          city,
          postalCode,
          country,
          lat: newLat,
          lng: newLng,
        },
      });

      /* Stores the shipping address information in local storage
         so that it can be retrieved later if needed. */
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify({
          fullName,
          address,
          city,
          postalCode,
          country,
          lat: newLat,
          lng: newLng,
        })
      );
      // Redirects the user to the payment page.
      navigate("/payment");
    }
  };
  const chooseOnMap = () => {
    /* dispatches an action with the fullName, address, city, postalCode, country, lat, lng 
       and saves it to the store through the saveShippingAddress function */
    ctxDispatch(
      saveShippingAddress({
        fullName,
        address,
        city,
        postalCode,
        country,
        lat,
        lng,
      })
    );
    // Redirects the user to the map page.
    navigate("/map");
  };
  return (
    <div>
      {" "}
      <div className='container small-container'>
        <Helmet>
          <title>Shipping Address</title>
        </Helmet>

        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
          <h1 className='mb-4 text-xl'>Shipping Address</h1>
          <div className='mb-4'>
            <label htmlFor='fullName'>Full Name</label>
            <input
              className='w-full'
              value={fullName}
              autoFocus
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label>Address</label>
            <input
              className='w-full'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label>City</label>
            <input
              className='w-full'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label>Postal Code</label>
            <input
              className='w-full'
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label>Country</label>
            <input
              className='w-full'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div className='mb-4 flex justify-between'>
            <button
              id='chooseOnMap'
              type='button'
              variant='light'
              onClick={chooseOnMap}
            >
              Choose Location On Map
            </button>
          </div>

          <div className='mb-3'>
            <button className='primary-button' type='submit'>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingAddressScreen;
