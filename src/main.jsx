// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";


import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { AuthProvider } from "./context/AuthContext"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider> 
      <RouterProvider router={router}>
        
      </RouterProvider>
    </AuthProvider>
  </StrictMode>
);