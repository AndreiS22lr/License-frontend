import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  const [count, setCount] = useState(0);
  const countIncrement = () => setCount(count + 1);
  const countDecrement = () => setCount(count - 1);

  return (
    <div>
      <Navbar />

      {/* Shared Counter */}
      <div className="p-4 bg-indigo-100 text-indigo-900">
        <div className="mb-2 font-semibold">Current count: {count}</div>
        <button
          onClick={countIncrement}
          className="px-3 py-1 bg-indigo-500 text-white rounded mr-2 hover:bg-indigo-600"
        >
          +
        </button>
        <button
          onClick={countDecrement}
          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          -
        </button>
      </div>

      {/* Render route-specific pages here */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
