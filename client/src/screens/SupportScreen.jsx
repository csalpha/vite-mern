import React, { useContext, useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";

// declare empty arrays and an empty object
let allUsers = [];
let allMessages = [];
let allSelectedUser = {};

// define the endpoint that will be used to make API calls to the server
const ENDPOINT =
  // If the window location host contains "localhost"
  window.location.host.indexOf("localhost") >= 0
    ? // then the API will be called using the IP address "127.0.0.1" and port 5000
      "http://127.0.0.1:5000"
    : // Otherwise, the API will be called using the current window location host
      window.location.host;

// Create a functional component called SupportScreen
const SupportScreen = () => {
  /* use the "useState" and "useRef" hooks provided by React 
     to manage state and references in the functional component */

  // "useState" is used to declare and initialize state variables and to update their values.
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // "useRef" is used to create a mutable reference that persists across component re-renders.
  // "uiMessagesRef" mutable reference is used to reference the DOM element that displays the chat messages.
  const uiMessagesRef = useRef(null);

  //  destructuring state object from Store Context
  const { state } = useContext(Store);

  // destructing userInfo from the state object
  const { userInfo } = state;

  // perform actions after the component has been rendered or updated.
  useEffect(() => {
    // whenever a new message is added to the chat
    if (uiMessagesRef.current) {
      // scroll the chat messages to the bottom of the screen
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: "smooth",
      });
    }

    // If the socket does not exist.
    if (!socket) {
      const sk = socketIOClient(ENDPOINT);
      setSocket(sk);
      sk.emit("onLogin", {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      sk.on("message", (data) => {
        if (allSelectedUser._id === data._id) {
          allMessages = [...allMessages, data];
        } else {
          const existUser = allUsers.find((user) => user._id === data._id);
          if (existUser) {
            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? { ...user, unread: true } : user
            );
            setUsers(allUsers);
          }
        }
        setMessages(allMessages);
      });
      sk.on("updateUser", (updatedUser) => {
        const existUser = allUsers.find((user) => user._id === updatedUser._id);
        if (existUser) {
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? updatedUser : user
          );
          setUsers(allUsers);
        } else {
          allUsers = [...allUsers, updatedUser];
          setUsers(allUsers);
        }
      });
      sk.on("listUsers", (updatedUsers) => {
        allUsers = updatedUsers;
        setUsers(allUsers);
      });
      sk.on("selectUser", (user) => {
        allMessages = user.messages;
        setMessages(allMessages);
      });
    }
  }, [messages, socket, users, userInfo]);

  const selectUser = (user) => {
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    socket.emit("onUserSelected", user);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      allMessages = [
        ...allMessages,
        { body: messageBody, name: userInfo.name },
      ];
      setMessages(allMessages);
      setMessageBody("");
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
        });
      }, 1000);
    }
  };

  return (
    <div className='top full-container'>
      <Helmet>
        <title>Support</title>
      </Helmet>
      <div md={3} className='support-users'>
        {users.filter((x) => x._id !== userInfo._id).length === 0 && (
          <MessageBox>No Online User Found</MessageBox>
        )}
        <ul>
          {users
            .filter((x) => x._id !== userInfo._id)
            .map((user) => (
              <li
                key={user._id}
                className={user._id === selectedUser._id ? "  selected" : "  "}
              >
                <button
                  varaint='light'
                  type='button'
                  onClick={() => selectUser(user)}
                >
                  {user.name}
                </button>
                <span
                  className={
                    user.unread ? "unread" : user.online ? "online" : "offline"
                  }
                />
              </li>
            ))}
        </ul>
      </div>
      <div md={9} className='support-messages'>
        {!selectedUser._id ? (
          <MessageBox>Select a user to start chat</MessageBox>
        ) : (
          <div>
            <div>
              <strong>Chat with {selectedUser.name} </strong>
            </div>
            <ul ref={uiMessagesRef}>
              {messages.length === 0 && <li>No message.</li>}
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{`${msg.name}: `}</strong> {msg.body}
                </li>
              ))}
            </ul>
            <div>
              <form onSubmit={submitHandler} className='row'>
                <div>
                  <input
                    type='text'
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder='type message'
                    aria-describedby='button-search'
                  />
                  <button type='submit'>Send</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportScreen;
