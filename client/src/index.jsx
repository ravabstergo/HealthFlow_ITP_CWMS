import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { HoverPanelProvider } from "./context/HoverPanelContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <HoverPanelProvider>
          <App />
          </HoverPanelProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
