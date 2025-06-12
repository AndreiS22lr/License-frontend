import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";
import Lessons from "../pages/Lessons";
import Exercises from "../pages/Exercises";
import Songs from "../pages/Songs";
import MySongs from "../pages/MySongs";
import Login from "../pages/Login";
import LessonDetail from "../pages/LessonDetail";
import LessonForm from "../pages/LessonForm";



export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/lessons", element: <Lessons /> },
      { path: "/exercises", element: <Exercises /> },
      { path: "/songs", element: <Songs /> },
      { path: "/mysongs", element: <MySongs /> },
      { path: "/lessons/:id", element: <LessonDetail /> },
      // Rute pentru autentificare (dacă le vrei deja funcționale)
      { path: "/login", element: <Login /> },
      { path: "/lessons/new", element: <LessonForm /> },
      { path: "/lessons/edit/:id", element: <LessonForm /> },
      
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
