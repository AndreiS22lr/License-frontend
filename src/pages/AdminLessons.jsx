// src/pages/AdminLessons.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Importă AuthContext

const AdminLessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token, isAuthenticated, user, logout } = useContext(AuthContext);

    
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            alert('Nu ai permisiuni de administrator pentru a accesa această pagină.');
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    
    const fetchLessons = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:3000/api/lessons', {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            setLessons(response.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Eroare la preluarea lecțiilor pentru admin:', err);
            setError('Nu s-au putut încărca lecțiile pentru administrare.');
            setLoading(false);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                logout();
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            fetchLessons();
        }
    }, [isAuthenticated, user, token]); 

    
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Ești sigur că vrei să ștergi această lecție? Această acțiune este ireversibilă și va șterge și fișierele asociate!')) {
            return;
        }

        if (!token) {
            alert('Nu ești autentificat. Te rog loghează-te.');
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/api/lessons/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Lecția a fost ștearsă cu succes!');
            fetchLessons(); 
        } catch (err) {
            console.error('Eroare la ștergerea lecției:', err);
            setError(err.response?.data?.message || 'Eroare la ștergerea lecției.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                logout();
                navigate('/login');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă lecțiile pentru administrare...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4">
                <p className="text-xl text-red-700 mb-4">{error}</p>
                <button
                    onClick={fetchLessons} 
                    className="bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                >
                    Reîncarcă Lecțiile
                </button>
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="container mx-auto p-6 text-center bg-white rounded-xl shadow-lg my-8">
                <h1 className="text-4xl font-extrabold text-white mb-6">Administrare Lecții</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Momentan nu există lecții. Adaugă prima lecție!
                </p>
                <Link
                    to="/admin/lessons/create"
                    className="bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300 inline-block"
                >
                    Adaugă Lecție Nouă
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold text-white">Administrare Lecții</h1>
                <Link
                    to="/admin/lessons/create"
                    className="bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                >
                    Adaugă Lecție Nouă
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ordine
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Titlu
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Imagine
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Audio
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acțiuni
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.sort((a, b) => a.order - b.order).map((lesson) => ( 
                                <tr key={lesson.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{lesson.order}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{lesson.title}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {lesson.sheetMusicImageUrl ? (
                                            <img
                                                src={`http://localhost:3000${lesson.sheetMusicImageUrl}`}
                                                alt="Partitură"
                                                className="w-16 h-16 object-cover rounded-full"
                                            />
                                        ) : (
                                            <p className="text-gray-500">N/A</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {lesson.audioUrl ? (
                                            <audio controls src={`http://localhost:3000${lesson.audioUrl}`} className="w-24"></audio>
                                        ) : (
                                            <p className="text-gray-500">N/A</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex space-x-3">
                                            <Link
                                                to={`/admin/lessons/edit/${lesson.id}`}
                                                className="text-blue-600 hover:text-blue-900 font-semibold"
                                            >
                                                Editează
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="text-red-600 hover:text-red-900 font-semibold"
                                            >
                                                Șterge
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLessons;