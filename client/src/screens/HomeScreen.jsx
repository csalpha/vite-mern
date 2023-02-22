import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "../components/Product";

// {} []

const HomeScreen = () => {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/products/top-products"
      const { data: products } = await axios.get("/api/products/top-products");
      setProduct(products);
    };
    fetchData();
    return () => {};
  }, []);

  return (
    <div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {products.map((product) => (
          <div key={product._id} className='mb-3'>
            <Product product={product}></Product>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
