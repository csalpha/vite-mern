import { useState, useEffect, useContext } from "react";
import logo from "./assets/react.svg";
import reactLogo from "./assets/react.svg";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Store } from "./Store";

// [] {}

function App() {
  const [toggleMenu, setToggleMenu] = useState(false);

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { cart, userInfo } = state;

  const { cartItems } = cart;

  return (
    <BrowserRouter>
      <div className='flex min-h-screen flex-col justify-between '>
        <Helmet>
          <title>Vite</title>
        </Helmet>
        <header>
          <nav className='gradient-bg-nav flex h-12 items-center px-4 justify-between shadow-md text-white'>
            <div className='md:flex-[0.5] flex-initial justify-center items-center'>
              <img src={logo} alt='logo' className='w-8 cursor-pointer' />
            </div>
            <ul className='text-white md:flex hidden list-none flex-row justify-between items-center flex-initial'>
              <li className={`mx-4 cursor-pointer my-2 text-lg`}>About</li>
              <li className={`mx-4 cursor-pointer my-2 text-lg`}>Services</li>
              <li className={`mx-4 cursor-pointer my-2 text-lg`}>Contacts</li>
              <li className={`mx-4 cursor-pointer my-2 text-lg`}>Cart</li>
              <li className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                Login
              </li>
            </ul>
            <div className='flex relative'>
              {!toggleMenu && (
                <HiMenuAlt4
                  fontSize={28}
                  className='text-white md:hidden cursor-pointer'
                  onClick={() => setToggleMenu(true)}
                />
              )}
              {toggleMenu && (
                <AiOutlineClose
                  fontSize={28}
                  className='text-white md:hidden cursor-pointer'
                  onClick={() => setToggleMenu(false)}
                />
              )}
              {toggleMenu && (
                <ul
                  className='z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in'
                >
                  <li className='text-xl w-full my-2'>
                    <AiOutlineClose onClick={() => setToggleMenu(false)} />
                  </li>
                  <li className={`mx-4 cursor-pointer my-2 text-lg`}>About</li>
                  <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                    Services
                  </li>
                  <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                    Contacts
                  </li>
                  <li className={`mx-4 cursor-pointer my-2 text-lg`}>Cart</li>

                  <li className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                    Login
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </header>
        <main className='container m-auto mt-4 px-4'>
          <Carousel showArrows autoPlay showThumbs={false}></Carousel>
          <Routes>
            <Route path='/product/:id' element={<ProductScreen />}></Route>
            <Route path='/' element={<HomeScreen />}></Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
