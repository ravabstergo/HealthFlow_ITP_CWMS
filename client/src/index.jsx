import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import AuthInterceptor from "./components/AuthInterceptor";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthInterceptor>
          <App />
        </AuthInterceptor>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
