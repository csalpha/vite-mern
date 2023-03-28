import { createContext, useReducer } from "react";
// import logger from 'use-reducer-logger';

/* we wanna use react context to save the cart items in a global state
   and use it in Components */

/* Create and export Context ( Store )  */
export const Store = createContext();

/* define initialState */
const initialState = {
  /* cart */
  cart: {
    /* cart items */
    cartItems: localStorage.getItem("cartItems")
      ? /* convert JSON string into an object */
        JSON.parse(
          localStorage.getItem(
            "cartItems" // pass parameter
          )
        )
      : // otherwise
        [],

    /* shippingAddress */
    shippingAddress: localStorage.getItem("shippingAddress")
      ? /* convert JSON string into an object */
        JSON.parse(
          localStorage.getItem(
            "shippingAddress" // pass parameter
          )
        )
      : // otherwise
        {
          location: {}, // set location to empty object
        },

    /* paymentMethod */
    paymentMethod: localStorage.getItem("paymentMethod")
      ? localStorage.getItem("paymentMethod")
      : "",
  },

  /* user info */
  userInfo: localStorage.getItem(
    "userInfo" // parameter
  ) // if it's true
    ? /* convert JSON string into an object */
      JSON.parse(
        localStorage.getItem(
          "userInfo" // parameter
        )
      ) /*otherwise */
    : null,
};

/* define reducer that accept two parameters */
function reducer(
  state, // 1st parameter
  action // 2nd parameter
) {
  /* define switch case that accept one parameter 
  and check action.type */
  switch (
    action.type // parameter
  ) {
    /* case action.type is 'CART_ADD_ITEM' */
    case "CART_ADD_ITEM": {
      /* get newItem from action.payload */
      const newItem = action.payload;

      /* get existItem  */
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id // pass param
      );

      /* 
      otherwise simply using the constructing array operator 
      to decontruct all items in the cart and concatenate them 
      with the new item */

      /* get cart items */
      const cartItems = existItem // if it's true
        ? //check each item in the cartItems
          state.cart.cartItems.map((item) =>
            item.name === existItem.name // if it's true
              ? //newItem contains the new quantity of this item on the cart
                newItem
              : // otherwise
                // keep the items in the cart items as they are
                item
          )
        : // otherwise
          [
            ...state.cart.cartItems, // [0] - keep all values
            newItem, // [1]
          ]; // we push the new item at the end of the cart items

      // save cart in the localStorage
      localStorage.setItem(
        "cartItems", // 1st param
        JSON.stringify(
          cartItems // pass cartItems
        ) // 2nd param
      );

      // return updated cart items
      return {
        ...state, // keep all values in the field
        cart: {
          ...state.cart, // keep all values in the field
          cartItems, // update cartItems
        },
      };
    }
    /* case action.type is 'CART_REMOVE_ITEM' */
    case "CART_REMOVE_ITEM": {
      // get catItems
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id // 1st param
      );
      localStorage.setItem(
        "cartItems", // 1st param
        JSON.stringify(cartItems) // 2nd param
      );
      /* return all cart items except that we passed in the
      action.payload */
      return {
        ...state, // keep previous state
        cart: {
          ...state.cart, // keep previous state
          cartItems, // update cartItems
        },
      };
    }
    /* case action.type is 'CART_RESET' */
    case "CART_RESET":
      // implement CART_RESET action
      return {
        ...state, // keep the previous state
        // make cart a empty object
        cart: {
          cartItems: [],
          shippingAddress: { location: {} },
          paymentMethod: "",
        },
      };
    /* case action.type is 'CART_CLEAR_ITEMS' */
    case "CART_CLEAR_ITEMS":
      // implement CART_CLEAR_ITEMS
      return {
        ...state, // keep the previous state
        cart: {
          ...state.cart, // keep the cart
          cartItems: [], // set cartItems to empty array
        },
      };
    /* case action.type is 'SAVE_SHIPPING_ADDRESS' */
    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state, // keep previous state
        cart: {
          ...state.cart, // keep previous state
          shippingAddress: {
            ...state.cart.shippingAddress, // keep previous state
            ...action.payload, // keep all values
            /* is comming from the shipping form, the data that user entered in 
            the input boxes */
          },
        },
      };
    /* case action.type is 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION' */
    case "SAVE_SHIPPING_ADDRESS_MAP_LOCATION":
      return {
        ...state, // keep previous state
        cart: {
          ...state.cart, // keep previous state.cart
          shippingAddress: {
            ...state.cart.shippingAddress, // keep previous state.cart.shippingAddress
            location: action.payload, // set location to action.payload
          },
        },
      };
    /* case action.type is 'SAVE_PAYMENT_METHOD' */
    case "SAVE_PAYMENT_METHOD":
      return {
        ...state, // keep previous state
        cart: {
          ...state.cart, // keep previous state.cart
          paymentMethod: action.payload, // set paymentMethod to action.payload
        },
      };
    /* case action.type is 'CART_CLEAR' */
    case "CART_CLEAR":
      return {
        ...state, // keep previous state
        cart: {
          ...state.cart, // keep previous state
          cartItems: [], // empty array
        },
      };
    /* case action.type is 'USER_SIGNIN' */
    case "USER_SIGNIN":
      return {
        ...state, // keep previous state
        userInfo: action.payload, // set userInfo to action.payload
      };
    /* case action.type is 'USER_SIGNOUT' */
    case "USER_SIGNOUT":
      return {
        ...state, // keep previous state
        userInfo: null, // set userInfo to null
        cart: {
          cartItems: [], // set cartItems to an empty array
          shippingAddress: {
            location: {}, // set to location to an empty object
          },
          paymentMethod: "", // set paymentMethod to an empty string
        },
      };
    /* default case */
    default:
      /* return state as it is */
      return state;
  }
}

/* StoreProvider - is a Wrapper for React App and pass global props to children */
/* provedor de dados */
/* Provedor de Loja */
export function StoreProvider(
  props // get global props
) {
  // get state and dispatch from useReducer
  const [
    state, // [0] get state from useReducer
    dispatch, // [1] get dispatch from useReducer
    // define useReducer
  ] = useReducer(
    //process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    reducer, // 1st parameter
    initialState // 2nd parameter
  );

  /* define value object
   the value contain current state in the context and
   the dispatch to update state in the context */

  /* context global data */
  const value = {
    state,
    dispatch,
  };

  // return Store ( is comming from react context )
  // get Provider from the Store object
  // render {props.children}
  return (
    /* Provedor de Loja */
    <Store.Provider
      value={value} // set value to value
    >
      {props.children} {/* All React Components */}
    </Store.Provider>
  );
}
