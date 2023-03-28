import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "./Store";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <HelmetProvider>
    <StoreProvider>
      <React.StrictMode>
        <PayPalScriptProvider
          options={{ "client-id": "test" }}
          deferLoading={true}
        >
          <App />
        </PayPalScriptProvider>
      </React.StrictMode>
    </StoreProvider>
  </HelmetProvider>
);
