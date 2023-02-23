import React from "react";
import { Link } from "react-router-dom";
// {}
const Product = (props) => {
  const { product } = props;

  return (
    /* render card */
    <div className='card'>
      <Link to={`/product/${product.slug}`}>
        <a>
          <img
            src={product.image}
            alt={product.name}
            className='rounded shadow object-cover h-64 w-full'
          />
        </a>
      </Link>
      <div className='flex flex-col items-center justify-center p-5'>
        <Link to={`/product/${product.slug}`}>
          <a>
            <h2 className='text-lg'>{product.name}</h2>
          </a>
        </Link>
        {/* <Link to={`/seller/${product.seller}`}> */}
        <p className='mb-2'>{product.brand}</p>
        {/* </Link> */}
        <p>{product.price} €</p>
        <button
          className='primary-button'
          type='button'
          onClick={() => addToCartHandler(product)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default Product;
