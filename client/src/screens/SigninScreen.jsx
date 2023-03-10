import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { getError } from "../utils";

const SigninScreen = () => {
  const navigate = useNavigate();

  /* set initial states for email and password 
  and create state variables using the hook 'useState' */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* extract 'search' object from the current 
     location using the hook 'useLocation' */
  const { search } = useLocation();

  /* get the redirect parameter from 
  the URL query parameters 'search' */
  const redirectInUrl = new URLSearchParams(search).get("redirect");

  /* if there is no redirect parameter provided in the query,
   set the 'redirect' variable to '/' */
  const redirect = redirectInUrl ? redirectInUrl : "/";

  // fetch the state and dispatcher function of the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);

  /* extract the 'userInfo' object from the Store state */
  const { userInfo } = state;

  // asynchronous function that handles form submission for user signin.
  const submitHandler = async (e) => {
    // prevents the default form submission
    e.preventDefault();
    try {
      /*  send a POST request to a API endpoint for user signin */
      const { data } = await Axios.post(
        "/api/users/signin", // API endpoint
        {
          email,
          password,
        }
      );
      // updates the user's information context
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      // saves the user's information in local storage
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
    } catch (err) {
      // If the request fails function catches the error and displays a toast error message
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Initialize a boolean state
  const [passwordShown, setPasswordShown] = useState(false);

  // Password toggle handler
  const togglePassword = () => {
    // When the handler is invoked
    // inverse the boolean state of passwordShown
    setPasswordShown(!passwordShown);
  };

  return (
    <div>
      <div>
        <Helmet>
          <title>Sign In</title>
        </Helmet>

        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
          <h1 className='mb-4 text-xl'>Login</h1>
          <div className='mb-4'>
            <label htmlFor='email'>Email</label>
            <input
              className='w-full'
              type='email'
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='password'>Password</label>

            <input
              className='w-full'
              type={passwordShown ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* <FontAwesomeIcon onClick={togglePassword} icon={faEye} /> */}
          </div>

          <div className='mb-4 '>
            <button className='primary-button' type='submit'>
              Sign In
            </button>
          </div>
          <div className='mb-4 '>
            New customer?{" "}
            <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SigninScreen;
