import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import Product from "../components/Product";

// {} []

const SellerScreen = () => {
  const [user, setSeller] = useState([]);
  const [products, setProducts] = useState([]);

  // retrieve the route parameters from the current URL
  const params = useParams();
  console.log("params:", params);

  const { id: sellerId } = params;

  // using the useEffect hook to fetch data from an API endpoint when the component mounts
  useEffect(
    () => {
      const fetchData = async () => {
        try {
          /* using Axios to make a HTTP GET request to an API endpoint at /api/users/sellers/${sellerId}
           to retrieve data for a specific seller identified by sellerId */
          const { data: user } = await Axios.get(
            `/api/users/sellers/${sellerId}`
          );

          /* using Axios to make an HTTP GET request to an API endpoint at /api/products/sellers/${sellerId} 
          to retrieve data for products associated with a specific seller identified by sellerId */
          const { data: products } = await Axios.get(
            `/api/products/sellers/${sellerId}`
          );
          // update the state of the products
          setProducts(products);
          // update the state of the seller
          setSeller(user);
        } catch (error) {}
      };
      fetchData();
    },
    // the useEffect hook will execute the fetchData function whenever the sellerId variable changes.
    [sellerId]
  );

  console.log(user);
  console.log(products);

  return (
    <div>
      <div className='py-2'>
        <Link to='/'>back to products</Link>
        <h1>{sellerId}</h1>
      </div>
      <div className='grid md:grid-cols-4 md:gap-3'>
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
