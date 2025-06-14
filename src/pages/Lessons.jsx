// src/pages/Lessons.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Asigură-te că calea este corectă

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Context de autentificare, chiar dacă pagina este publică, este bine să-l ai disponibil
    // pentru eventuale logici condiționale (ex: afisare buton de admin)
    const { isAuthenticated, user } = useContext(AuthContext); 

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/lessons');
                setLessons(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching lessons:", err);
                setError("Nu s-a putut încărca lista de lecții. Te rog încearcă din nou.");
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Încărcare lecții...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-50 p-4">
                <p className="text-xl text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Lecții Disponibile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lessons.length > 0 ? (
                    lessons.map(lesson => (
                        <div key={lesson.id} className="bg-red-600 rounded-xl shadow-lg overflow-hidden flex flex-col p-4 border border-red-700"> {/* MODIFICAT: p-6 la p-4 */}
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-2xl font-extrabold text-white leading-tight"> {/* MODIFICAT: text-3xl la text-2xl */}
                                    {lesson.order}. {lesson.title}
                                </h2>
                                {/* Poți adăuga o iconiță aici dacă dorești, de ex. un ochi sau o săgeată */}
                            </div>
                            
                            {/* ELIMINAT: Conținutul teoriei sau imaginii din cardul principal */}
                            {/* <div className="text-gray-300 text-base mb-4">
                                {lesson.sheetMusicImageUrl && (
                                    <img 
                                        src={`http://localhost:3000${lesson.sheetMusicImageUrl}`} 
                                        alt={lesson.title} 
                                        className="w-full h-48 object-cover rounded-md mb-2" 
                                    />
                                )}
                                {lesson.theoryContent && (
                                    <p dangerouslySetInnerHTML={{ __html: lesson.theoryContent.substring(0, 100) + '...' }}></p>
                                )}
                            </div> */}

                            <div className="mt-auto text-right"> {/* Butonul rămâne jos la dreapta */}
                                <Link
                                    to={`/lessons/${lesson.id}`}
                                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-red-800 font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                                >
                                    Vezi Lecția
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-700 text-xl">Nu există lecții disponibile momentan.</p>
                )}
            </div>
        </div>
    );
};

export default Lessons;
