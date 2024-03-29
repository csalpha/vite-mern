import React from "react";

/* define Rating */
export default function Rating(
  props // pass props
) {
  const {
    rating, // get rating from the props
    numReviews, // get numReviews from the props
    caption, // get caption from the props
  } = props;

  return (
    /* render rating div */
    <div className='rating'>
      {/* render span */}
      <span>
        {/* render icon */}
        <i
          className={
            rating >= 1 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
              rating >= 0.5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
                // set className text
                "w-5 h-5 text-yellow-400"
          }
        ></i>
      </span>
      {/* render span */}
      <span>
        {/* render icon */}
        <i
          className={
            rating >= 2 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
              rating >= 1.5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
                // set className text
                "w-5 h-5 text-yellow-400"
          }
        ></i>
      </span>
      {/* render span */}
      <span>
        {/* render icon */}
        <i
          className={
            rating >= 3 /* true condiction */
              ? "w-5 h-5 text-yellow-400"
              : // otherwise
              rating >= 2.5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
                // set className text
                "w-5 h-5 text-yellow-400"
          }
        ></i>
      </span>
      {/* render span */}
      <span>
        {/* render icon */}
        <i
          className={
            rating >= 4 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
              rating >= 3.5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
                // set className text
                "w-5 h-5 text-yellow-400"
          }
        ></i>
      </span>
      {/* render span */}
      <span>
        {/* render icon */}
        <i
          className={
            rating >= 5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
              rating >= 4.5 /* true condiction */
              ? // set className text
                "w-5 h-5 text-yellow-400"
              : // otherwise
                // set className text
                "w-5 h-5 text-yellow-400"
          }
        ></i>
      </span>
      {caption ? ( // caption is defined
        <span>{caption}</span>
      ) : (
        // otherwise ( caption is not defined )
        <span>{" " + numReviews + " reviews"}</span>
      )}
    </div>
  );
}
