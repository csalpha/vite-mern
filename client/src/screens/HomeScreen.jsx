import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "../components/Product";

// {} []

const HomeScreen = () => {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get("/api/products");
      setProduct(data);
    };
    fetchData();
    return () => {
      //
    };
  }, []);

  console.log(products);
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
