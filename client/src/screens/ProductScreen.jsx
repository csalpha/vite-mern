import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Axios from "axios";

// { } []

const ProductScreen = () => {
  const [product, setProduct] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const { id: slug } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: product } = await Axios.get(`/api/products/slug/${slug}`);
        setProduct(product);
      } catch (error) {}
    };

    fetchData();
  }, []);

  const addToCartHandler = async () => {
    console.log("Add to cart");
  };

  // // console.log(product);

  return (
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
    </div>
  );
};

export default ProductScreen;
