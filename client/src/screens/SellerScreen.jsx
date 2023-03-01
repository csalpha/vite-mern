import React, { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import Product from "../components/Product";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

// {} []

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        products: action.payload.products,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const SellerScreen = () => {
  const [{ loading, error, products, user }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const params = useParams();
  const { id: sellerId } = params;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data: user } = await Axios.get(
          `/api/users/sellers/${sellerId}`
        );
        const { data: products } = await Axios.get(
          `/api/products/sellers/${sellerId}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: { user, products } });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [dispatch, sellerId]);

  console.log(user);
  console.log(products);

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
        <div>
          <div>
            <div className='md:col-span-2'>
              <img
                className='img-small'
                src={user.seller.logo}
                alt={user.seller.name}
              ></img>
              <div>
                {" "}
                <h1 className='text-lg'>{user.seller.name}</h1>
              </div>
              <div
                rating={user.seller.rating}
                numReviews={user.seller.numReviews}
              ></div>
              <div>
                <a href={`mailto:${user.email}`}>Contact Seller</a>
              </div>
              <div>{user.seller.description}</div>
            </div>
          </div>
        </div>
        {
          //iterate over an array of products and generate a list of <div> elements, each containing a <Product> component.
          products.map((product) => (
            // The key prop is used to give each <div> a unique identifier.
            <div sm={6} lg={4} className='mb-3' key={product._id}>
              <Product product={product}></Product>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default SellerScreen;
