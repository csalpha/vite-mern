import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "./Store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <HelmetProvider>
    <StoreProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </StoreProvider>
  </HelmetProvider>
);
