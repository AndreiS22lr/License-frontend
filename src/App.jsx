import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  const [count, setCount] = useState(0);
  const countIncrement = () => setCount(count + 1);
  const countDecrement = () => setCount(count - 1);

  return (
    
      <div className="bg-cyan-950 min-h-screen">
      <Navbar />

      

      {/* Render route-specific pages here */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
