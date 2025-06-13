// src/router/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";
import Lessons from "../pages/Lessons"; // Ruta publică pentru lista de lecții
import Exercises from "../pages/Exercises";
import Songs from "../pages/Songs";
import MySongs from "../pages/MySongs";
import Login from "../pages/Login"; // Asigură-te că aceasta este pagina ta de login
import LessonDetail from "../pages/LessonDetail"; // Ruta publică pentru detalii lecție
import LessonForm from "../pages/LessonForm"; // Componenta pentru creare/editare lecție
import AdminLessons from "../pages/AdminLessons"; // <-- NOU: Importă AdminLessons

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: "/lessons", element: <Lessons /> },
            { path: "/exercises", element: <Exercises /> },
            { path: "/songs", element: <Songs /> },
            { path: "/mysongs", element: <MySongs /> },
            { path: "/lessons/:id", element: <LessonDetail /> }, // Detaliile unei lecții (vizibil pentru toți)
            
            // Rute pentru autentificare
            { path: "/login", element: <Login /> },
            
            // --- NOU: Rute dedicate administrării lecțiilor ---
            // Ruta principală pentru lista de lecții a administratorului
            { path: "/admin/lessons", element: <AdminLessons /> },
            // Ruta pentru formularul de creare a unei noi lecții (accesibilă din AdminLessons)
            { path: "/admin/lessons/create", element: <LessonForm /> },
            // Ruta pentru formularul de editare a unei lecții existente
            { path: "/admin/lessons/edit/:id", element: <LessonForm /> },
            // --- Sfârșit rute administrare ---
        ],
    },
    {
        path: "*", // Catch-all pentru rute inexistente
        element: <ErrorPage />,
    },
]);