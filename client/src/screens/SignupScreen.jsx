import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { getError } from "../utils";

const SignupScreen = () => {
  // navigate to different pages or URLs within the application
  const navigate = useNavigate();

  /* The useState hook also initializes 
  each of these variables to an empty string */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* declares a constant called 'search' and assigns it the value
   of the 'search' property of the object returned by the 'useLocation()' hook. */
  const { search } = useLocation();

  // Extracts the value of the "redirect" parameter from the current URL's search query,
  // and assigns it to the 'redirectInUrl' constant variable using the URLSearchParams() constructor.
  const redirectInUrl = new URLSearchParams(search).get("redirect");

  const redirect = redirectInUrl ? redirectInUrl : "/";

  // destructuring the context object into 2 variables.
  const {
    state, // contains the current state object containing various properties stored in the global store.
    dispatch: ctxDispatch, // used to update the global state objects or call specific action methods from the store.
  } = useContext(Store);

  // using destructuring to get the value of the userInfo property from the state object.
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault(); // prevents the default action
    try {
      // checks if password and confirmPassword match
      if (password !== confirmPassword) {
        // displays an error
        toast.error("Passwords do not match");
      } else {
        // makes an HTTP POST call to "/api/users/signup" endpoint
        const { data } = await Axios.post("/api/users/signup", {
          name,
          email,
          password,
        });
        // dispatches the user signin action along with payload obtained from server response
        ctxDispatch({ type: "USER_SIGNIN", payload: data });
        // saves user information in localStorage as JSON string
        localStorage.setItem("userInfo", JSON.stringify(data));
        // navigates user to homepage or destination set in redirect variable
        navigate(redirect || "/");
      }
      // catches errors that may arise from the try block
    } catch (err) {
      // display the appropriate error message
      toast.error(getError(err));
    }
  };

  // executes a callback function only when one of its dependency changes
  useEffect(
    () => {
      // If userInfo exists
      if (userInfo) {
        // navigate to the URL specified in the redirect variable
        navigate(redirect);
      }
      /* ensures that user gets automatically redirected 
      to certain URL once he/she is logged in. */
    },
    [navigate, redirect, userInfo] // dependencies of this Hook
  );

  // Initialize a boolean state
  const [passwordShown, setPasswordShown] = useState(false);

  //shows or hides the value of the password input field whenever it is called.
  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div>
      <div>
        <Helmet>
          <title>Sign Up</title>
        </Helmet>
        <h1 className='mb-4 text-xl'>Sign Up</h1>
        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
          <div className='mb-4'>
            <label htmlFor='email'>Name</label>
            <input
              type='name'
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='password'>Password</label>

            <input
              type={passwordShown ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* <FontAwesomeIcon onClick={togglePassword} icon={faEye} /> */}
          </div>

          <div className='mb-4'>
            <label htmlFor='password'>Confirm Password</label>

            <input
              type={passwordShown ? "text" : "password"}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* <FontAwesomeIcon onClick={togglePassword} icon={faEye} /> */}
          </div>

          <div className='mb-4 '>
            <button className='primary-button' type='submit'>
              Sign Up
            </button>
          </div>
          <div className='mb-4 '>
            Already have an account?{" "}
            <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupScreen;
