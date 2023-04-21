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
import SellerScreen from "./screens/SellerScreen";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import SignupScreen from "./screens/SignupScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Store } from "./Store";
import SearchBox from "./components/SearchBox";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PrivateRoute from "./components/PrivateRoute";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import AdminRoute from "./components/AdminRoute";
import DashboardScreen from "./screens/DashboardScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import ProductListScreen from "./screens/ProductListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import SellerRoute from "./components/SellerRoute";
import SupportScreen from "./screens/SupportScreen";
import ChatBox from "./components/ChatBox";

// [] {}

function App() {
  const [toggleMenu, setToggleMenu] = useState(false);

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { cart, userInfo } = state;

  const { cartItems } = cart;

  // defines a function named signoutHandler which clears user information and redirects to the signin page.
  const signoutHandler = () => {
    // dispatch action to sign out the user by changing the state of global context
    ctxDispatch({
      type: "USER_SIGNOUT", // the type of action is USER_SIGNOUT
    });

    // remove user information, cart items, shipping address and payment method from localStorage
    localStorage.removeItem(
      "userInfo" // pass parameter: 'userInfo'
    );
    localStorage.removeItem(
      "cartItems" // pass parameter: 'cartItems'
    );
    localStorage.removeItem(
      "shippingAddress" // pass parameter: 'shippingAddress'
    );
    localStorage.removeItem(
      "paymentMethod" // pass parameter: 'paymentMethod'
    );

    // redirect the user to the signin page by changing window location
    window.location.href = "/signin";
  };

  return (
    <BrowserRouter>
      <div className='flex min-h-screen flex-col justify-between '>
        <Helmet>
          <title>Vite</title>
        </Helmet>
        <header>
          <nav className='gradient-bg-nav flex h-12 items-center px-4 justify-between shadow-md text-white'>
            <div className='md:flex-[0.5] flex-initial justify-center items-center'>
              <Link to='/'>
                {" "}
                <img
                  src={logo}
                  alt='logo'
                  className='w-8 cursor-pointer'
                />{" "}
              </Link>
            </div>
            <ul className='text-white md:flex hidden list-none flex-row justify-between items-center flex-initial'>
              <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                <SearchBox />
              </li>{" "}
              <Link to='/'>
                {" "}
                <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                  About
                </li>{" "}
              </Link>
              <Link to='/'>
                {" "}
                <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                  Services
                </li>{" "}
              </Link>
              <Link to='/'>
                {" "}
                <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                  Contacts
                </li>{" "}
              </Link>
              <Link to='/cart'>
                {" "}
                <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                  Cart
                  {cartItems.length > 0 && (
                    <span className='ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white'>
                      {
                        //use reduce function to calculate accumulator (a) and current item (c)
                        // default value to accumulator is zero
                        cartItems.reduce((a, c) => a + c.quantity, 0)
                      }
                    </span>
                  )}
                </li>
              </Link>
              {userInfo ? (
                <>
                  <Link to='/'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      {"Hello, " + userInfo.name}
                    </li>
                  </Link>

                  <Link to='/orderhistory'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      Order History
                    </li>
                  </Link>
                  {userInfo && userInfo.isAdmin && (
                    <>
                      <Link to='/profile'>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          Profile
                        </li>
                      </Link>
                      <Link to='/dashboard'>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          Admin Dashboard
                        </li>
                      </Link>
                      <Link to='/support'>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          Support
                        </li>
                      </Link>
                    </>
                  )}
                  <Link className='' to='' onClick={signoutHandler}>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      Sign Out
                    </li>
                  </Link>
                </>
              ) : (
                <Link to='/signin'>
                  <li className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                    Login
                  </li>
                </Link>
              )}
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
                  <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                    <SearchBox />
                  </li>{" "}
                  <Link to='/'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      About
                    </li>
                  </Link>
                  <Link to='/'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      Services
                    </li>
                  </Link>
                  <Link to='/'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      Contacts
                    </li>
                  </Link>
                  <Link to='/cart'>
                    <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                      {" "}
                      Cart
                      {cartItems.length > 0 && (
                        <span className='ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white'>
                          {
                            //use reduce function to calculate accumulator (a) and current item (c)
                            // default value to accumulator is zero
                            cartItems.reduce((a, c) => a + c.quantity, 0)
                          }
                        </span>
                      )}
                    </li>
                  </Link>
                  {userInfo ? (
                    <>
                      <Link to=''>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          {"Hello, " + userInfo.name}
                        </li>
                      </Link>

                      <Link to='/orderhistory'>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          Order History
                        </li>
                      </Link>
                      {userInfo && userInfo.isAdmin && (
                        <>
                          <Link to='/profile'>
                            <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                              Profile
                            </li>
                          </Link>
                          <Link to='/dashboard'>
                            <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                              Admin Dashboard
                            </li>
                          </Link>
                          <Link to='/support'>
                            <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                              Support
                            </li>
                          </Link>
                        </>
                      )}
                      <Link className='' to='' onClick={signoutHandler}>
                        <li className={`mx-4 cursor-pointer my-2 text-lg`}>
                          Sign Out
                        </li>
                      </Link>
                    </>
                  ) : (
                    <Link to='/signin'>
                      <li className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                        Sign In
                      </li>
                    </Link>
                  )}
                </ul>
              )}
            </div>
          </nav>
        </header>
        <main className='container m-auto mt-4 px-4'>
          <Carousel showArrows autoPlay showThumbs={false}></Carousel>
          <Routes>
            <Route
              path='/productlist'
              element={
                <AdminRoute>
                  <ProductListScreen />
                </AdminRoute>
              }
            />
            <Route path='/product/:id' element={<ProductScreen />}></Route>
            <Route
              path='/product/:id/edit'
              element={<ProductEditScreen />}
            ></Route>
            <Route path='/' element={<HomeScreen />}></Route>
            <Route path='/seller/:id' element={<SellerScreen />}></Route>
            <Route path='/cart' element={<CartScreen />}></Route>
            <Route path='/signin' element={<SigninScreen />}></Route>
            <Route path='/signup' element={<SignupScreen />}></Route>
            <Route path='shipping' element={<ShippingAddressScreen />}></Route>
            <Route path='payment' element={<PaymentMethodScreen />}></Route>
            <Route path='placeorder' element={<PlaceOrderScreen />}></Route>
            <Route path='/order/:id' element={<OrderScreen />}></Route>
            <Route path='/search' element={<SearchScreen />}></Route>
            <Route
              path='/profile'
              element={
                <PrivateRoute>
                  <ProfileScreen />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path='/orderhistory'
              element={
                <PrivateRoute>
                  <OrderHistoryScreen />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path='/dashboard'
              element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              }
            />
            <Route
              path='/orderlist/seller'
              element={
                <SellerRoute>
                  <OrderListScreen />
                </SellerRoute>
              }
            />
            <Route
              path='/userlist'
              element={
                <AdminRoute>
                  <UserListScreen />
                </AdminRoute>
              }
            />
            <Route
              path='/product/:id/edit'
              element={
                <AdminRoute>
                  <ProductEditScreen />
                </AdminRoute>
              }
            />

            <Route
              path='/user/:id/edit'
              element={
                <AdminRoute>
                  <UserEditScreen />
                </AdminRoute>
              }
            />

            <Route
              path='/support'
              element={
                <AdminRoute>
                  <SupportScreen />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
        <div className='text-center'>
          <i className='fas fa-ellipsis-h'>chat</i>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
