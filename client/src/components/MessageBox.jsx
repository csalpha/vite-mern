import React from "react";
// {}
const MessageBox = (props) => {
  return (
    <div>
      <div className='text-red-500'>{props.children}</div>
    </div>
  );
};

export default MessageBox;
