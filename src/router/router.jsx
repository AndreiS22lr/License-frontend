import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";
import Page2 from "../pages/Page2";
import Page3 from "../pages/Page3";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/2", element: <Page2 /> },
      { path: "/3", element: <Page3 /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
