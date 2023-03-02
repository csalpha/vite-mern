import React, { useContext } from "react";
import { Store } from "../Store";
import MessageBox from "../components/MessageBox";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { XCircleIcon } from "@heroicons/react/outline";
import Axios from "axios";
import { toast } from "react-toastify";
// {  }

const CartScreen = () => {
  /* using destructuring to extract state and dispatch properties from the context object 
  and renaming dispatch to ctxDispatch for convenience. */
  const {
    state, // current state of the application
    dispatch: ctxDispatch, // dispatch is a function that is used to update the state
  } = useContext(Store);

  /* state and ctxDispatch variables can be used in the 
  current component to access and modify the application state. */

  // destructure cartItems from state
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty); // cast qty to number

    // call get method with the item ID to get product details from the API
    const { data } = await Axios.get(`/api/products/${item._id}`);

    // check if the countInStock is less than the provided quantity
    if (data.countInStock < quantity) {
      // display error if stock is not enough
      return toast.error("Sorry, this item is temporarily out of stock");
    }

    /* dispatches an action object to the store with type "CART_ADD_ITEM"
       and the item being added along with its quantity as payload     */
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: {
        ...item,
        quantity,
      },
    });
    toast.success("Product updated in the cart");
  };

  // This function is used to remove an item from the cart
  const removeItemHandler = (item) => {
    // dispatch action to update state in reducer
    ctxDispatch({
      type: "CART_REMOVE_ITEM",
      payload: item,
    });
  };

  console.log(cartItems);
  return (
    <div>
      <h1 className='mb-4 text-xl'>Shopping Cart</h1>
      {cartItems.length === 0 ? ( // true - Cart is empty
        <div>
          Your cart is empty. <Link href='/'>Continue shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <table className='min-w-full '>
              <thead>
                <tr>
                  <th className='p-5 text-left'>Item</th>
                  <th className='p-5 text-right'>Quatity</th>
                  <th className='p-5 text-right'>Price</th>
                  <th className='p-5'>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug}>
                    <td>
                      <Link href={`/product/${item.slug}`}>
                        <a className='flex items-center'>
                          <img
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></img>
                        </a>
                      </Link>
                    </td>
                    <td className='p-5 text-right'>
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartHandler(
                            item,
                            e.target.value /* new quantity of the item */
                          )
                        }
                      >
                        {/* use map function to convert numbers to options for the select box */}
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {/* Create an option element for each item in the countInStock array */}
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='p-5 text-right'>{item.price} €</td>
                    <td className='p-5 text-center'>
                      <button onClick={() => removeItemHandler(item)}>
                        <XCircleIcon className='h-5 w-5'></XCircleIcon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='card p-5'>
            <ul>
              <li>
                <div className='pb-3 text-xl'>
                  Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}) : €
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </div>
              </li>
              <li>
                {/* check authentication of user, 
                if user  logged in -> redirect user to the shipping screen 
                if it's not logged in, keep it in loggin screen */}
                <button
                  onClick={() => router.push("login?redirect=/shipping")}
                  className='primary-button w-full'
                >
                  Check Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
