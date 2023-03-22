import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  // Define a constant 'navigate' which holds useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Define a state variable 'query' using useState hook to store input value of user search
  const [query, setQuery] = useState("");

  // Define a function 'submitHandler' that is triggered when user submits the form
  const submitHandler = (e) => {
    // Prevents the default behavior of submitting the form on button click or press Enter in search field
    e.preventDefault();
    // // Navigate to search page with query string appended if 'query' exists; otherwise, navigate to generic search page
    navigate(query ? `/search/?query=${query}` : "/search");
  };

  return (
    <form className='d-flex me-auto' onSubmit={submitHandler}>
      <div>
        <input
          type='text'
          name='q'
          id='q'
          onChange={(e) => setQuery(e.target.value)}
          placeholder='search products...'
          aria-label='Search Products'
          aria-describedby='button-search'
        />
        <button type='submit' id='button-search'>
          <i className='fas fa-search'></i>
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
