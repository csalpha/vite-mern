import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "../components/Product";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";

// {} []

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/sellers/top-sellers"
      const { data: sellers } = await axios.get("/api/users/top-sellers");
      setSellers(sellers);

      // This code is using the Axios library to make an HTTP GET request to a server endpoint "/api/products/top-products"
      const { data: products } = await axios.get("/api/products/top-products");
      setProducts(products);
    };
    fetchData();
    return () => {};
  }, []);

  return (
    <div>
      <div className='py-2'>
        <h2 className=''>Top Sellers</h2>
      </div>
      <div className=''>
        <Carousel showArrows autoPlay showThumbs={false}>
          {sellers.map((seller) => (
            <div key={seller._id}>
              <Link to={`/seller/${seller._id}`}>
                <img src={seller.seller.logo} alt={seller.seller.name} />
                <p className='legend'>{seller.seller.name}</p>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
      <div className='py-2'>
        <h2 className=''>Top Products</h2>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {products.map((product) => (
          <div sm={6} lg={4} key={product._id} className='mb-3'>
            <Product product={product}></Product>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
