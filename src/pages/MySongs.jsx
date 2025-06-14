// src/pages/MySongs.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Importăm Link

const MySongs = () => {
    const [userRecordings, setUserRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // Pentru a urmări înregistrarea care este ștearsă

    const { token, isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirecționează dacă utilizatorul nu este autentificat
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Funcția pentru a prelua înregistrările utilizatorului
    const fetchUserRecordings = async () => {
        if (!token) {
            setError('Nu sunteți autentificat.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("FRONTEND DEBUG (MySongs): Se încearcă preluarea înregistrărilor utilizatorului.");
            const response = await axios.get('http://localhost:3000/api/user-recordings/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserRecordings(response.data.data);
            console.log("FRONTEND DEBUG (MySongs): Înregistrări utilizator preluate:", response.data.data);
        } catch (err) {
            console.error('FRONTEND ERROR (MySongs): Eroare la preluarea înregistrărilor utilizatorului:', err);
            if (err.response) {
                setError(err.response.data.message || 'Eroare la preluarea înregistrărilor.');
                if (err.response.status === 401 || err.response.status === 403) {
                    // Dacă tokenul este invalid/expirat, deconectează utilizatorul
                    logout();
                    navigate('/login');
                }
            } else {
                setError('Nu s-a putut conecta la server. Verifică conexiunea.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Apelăm funcția la montarea componentei și când token-ul se schimbă
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserRecordings();
        }
    }, [isAuthenticated, token]); // Rulează când se modifică starea de autentificare sau token-ul

    // Funcția pentru ștergerea unei înregistrări
    const handleDeleteRecording = async (recordingId) => {
        if (!window.confirm('Ești sigur că vrei să ștergi această înregistrare?')) {
            return;
        }

        if (!token) {
            setError('Nu sunteți autentificat pentru a șterge înregistrări.');
            return;
        }

        setDeletingId(recordingId); // Setează ID-ul înregistrării care este ștearsă
        try {
            console.log(`FRONTEND DEBUG (MySongs): Se șterge înregistrarea cu ID: ${recordingId}`);
            await axios.delete(`http://localhost:3000/api/user-recordings/${recordingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Reîmprospătează lista după ștergere
            fetchUserRecordings();
        } catch (err) {
            console.error('FRONTEND ERROR (MySongs): Eroare la ștergerea înregistrării:', err);
            setError(err.response?.data?.message || 'Eroare la ștergerea înregistrării.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
                navigate('/login');
            }
        } finally {
            setDeletingId(null); // Resetează ID-ul
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă înregistrările tale...</p>
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
            <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Cântările Mele</h1>

            

            {userRecordings.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-md">
                    <p className="text-xl text-gray-700 mb-4">Nu ai încă înregistrări salvate.</p>
                    <p className="text-gray-600">Accesează o lecție și încarcă-ți o înregistrare pentru a începe!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {userRecordings.map((recording) => (
                        <div key={recording.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col p-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Lecția: {recording.lessonDetails?.title || 'Lecție necunoscută'}
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Înregistrat la: {new Date(recording.createdAt).toLocaleDateString()}
                            </p>
                            
                            {recording.audioUrl && (
                                <div className="mb-4">
                                    <audio controls src={`http://localhost:3000${recording.audioUrl}`} className="w-full rounded-lg"></audio>
                                </div>
                            )}

                            <div className="mt-auto flex justify-between items-center">
                                {/* Buton pentru a merge la lecția corespunzătoare */}
                                <Link
                                    to={`/lessons/${recording.lessonId}`}
                                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-200 shadow-md"
                                >
                                    Vezi Lecția
                                </Link>

                                {/* Buton pentru ștergere */}
                                <button
                                    onClick={() => handleDeleteRecording(recording.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-200 shadow-md"
                                    disabled={deletingId === recording.id}
                                >
                                    {deletingId === recording.id ? 'Se șterge...' : 'Șterge'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySongs;

