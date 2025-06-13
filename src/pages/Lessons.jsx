// src/pages/Lessons.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                // Facem o cerere GET către ruta backend-ului pentru a prelua toate lecțiile
                const response = await axios.get('http://localhost:3000/api/lessons');

                // AICI ESTE MODIFICAREA CHEIE:
                // Accesăm array-ul de lecții din proprietatea 'data' a răspunsului
                setLessons(response.data.data || []); // <-- Modificat aici!
                
                setLoading(false); // Oprește starea de încărcare
            } catch (err) {
                console.error('Eroare la preluarea lecțiilor:', err);
                setError('Nu s-au putut încărca lecțiile. Te rog încearcă din nou mai târziu.');
                setLoading(false); // Oprește starea de încărcare chiar și în caz de eroare
            }
        };

        fetchLessons(); // Apelează funcția de preluare a lecțiilor la montarea componentei
    }, []); // Array de dependențe gol, se execută o singură dată la montare

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă lecțiile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4">
                <p className="text-xl text-red-700 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                >
                    Reîncarcă pagina
                </button>
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">Lecții de Muzică Bizantină</h1>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                    Momentan nu există lecții disponibile. Te rugăm să revii mai târziu sau să contactezi un administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">Lecții de Muzică Bizantină</h1>

            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                Aici vei găsi o colecție vastă de lecții, de la noțiuni fundamentale până la tehnici avansate, pentru a-ți aprofunda cunoștințele în muzica psaltică.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {lessons.map((lesson, index) => (
                    <Link to={`/lessons/${lesson.id}`} key={lesson.id} className="block group">
                        <div className="bg-red-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"> 
                            <div className="p-4 flex flex-col h-full">
                                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-red-100 transition-colors duration-300 flex items-center">
                                    <span className="bg-white text-red-700 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mr-2"> 
                                        {lesson.order || index + 1}
                                    </span>
                                    {lesson.title}
                                </h2>
                                <p className="text-white leading-relaxed text-sm flex-grow">
                                    {lesson.theoryContent ? `${lesson.theoryContent.substring(0, 100)}...` : 'Fără descriere.'} 
                                </p>
                                <span className="inline-block mt-4 bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full self-end"> 
                                    Vezi Lecția
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="text-center mt-16 p-8 bg-gray-500 text-white rounded-xl shadow-md">
                <h3 className="text-3xl font-bold mb-4">Pregătește-te pentru următoarele lecții!</h3>
                <p className="text-lg mb-6">
                    Conținutul este actualizat periodic. Rămâi conectat pentru noi cursuri și materiale.
                </p>
            </div>
        </div>
    );
};

export default Lessons;