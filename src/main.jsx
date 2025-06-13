// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
// import App from "./App.jsx"; // Nu mai este necesar App.jsx aici direct, deoarece RouterProvider se ocupă de rute

import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { AuthProvider } from "./context/AuthContext"; // <-- NOU: Importă AuthProvider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider> {/* <-- NOU: Înfășoară aici RouterProvider */}
      <RouterProvider router={router}>
        {/* <App /> - Dacă App.jsx era doar un wrapper pentru rute, nu mai este necesar aici */}
      </RouterProvider>
    </AuthProvider>
  </StrictMode>
);