// src/pages/LessonDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useContext(AuthContext);

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userRecording, setUserRecording] = useState(null);
    const [uploadingRecording, setUploadingRecording] = useState(false);
    const [recordingError, setRecordingError] = useState(null);

    const handleUserRecordingChange = (e) => {
        setUserRecording(e.target.files[0]);
    };

    const handleUserRecordingSubmit = async (e) => {
        e.preventDefault();
        setUploadingRecording(true);
        setRecordingError(null);

        if (!userRecording) {
            alert("Te rog selectează un fișier audio pentru înregistrare.");
            setUploadingRecording(false);
            return;
        }

        if (!token) {
            setRecordingError('Nu ești autentificat. Te rog loghează-te pentru a încărca înregistrări.');
            setUploadingRecording(false);
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', userRecording);

        console.log("Se pregătește înregistrarea utilizatorului pentru trimitere...");
        
        try {
            const response = await axios.post(`http://localhost:3000/api/lessons/${id}/upload-audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            console.log('Înregistrarea utilizatorului a fost trimisă cu succes:', response.data);
            alert('Înregistrarea ta a fost trimisă cu succes!');
            setUserRecording(null);

        } catch (error) {
            console.error('Eroare la trimiterea înregistrării utilizatorului:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                setRecordingError(error.response.data.message || error.response.data.error || 'Server error');
                if (error.response.status === 401 || error.response.status === 403) {
                    alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                    navigate('/login');
                }
            } else if (error.request) {
                console.error('Niciun răspuns de la server:', error.request);
                setRecordingError('Nu s-a putut conecta la server pentru a trimite înregistrarea. Verifică conexiunea.');
            } else {
                console.error('Eroare la configurarea cererii:', error.message);
                setRecordingError(`A apărut o eroare: ${error.message}`);
            }
        } finally {
            setUploadingRecording(false);
        }
    };

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/lessons/${id}`);
                setLesson(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Eroare la preluarea lecției:", err);
                setError("Nu s-a putut încărca lecția. Te rog încearcă din nou.");
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Încărcare lecție...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4">
                <p className="text-xl text-red-700 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/lessons')}
                    className="bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                >
                    Înapoi la lecții
                </button>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Lecția nu a fost găsită sau este invalidă.</p>
            </div>
        );
    }

    const sheetMusicImageUrl = lesson.sheetMusicImageUrl
        ? `http://localhost:3000${lesson.sheetMusicImageUrl}`
        : null;

    const lessonAudioUrl = lesson.audioUrl
        ? `http://localhost:3000${lesson.audioUrl}`
        : null;

    return (
        <div className="container mx-auto p-6">
            {/* Secțiunea de detalii a lecției (conținut admin) */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{lesson.title}</h1>

                {sheetMusicImageUrl && (
                    <img
                        src={sheetMusicImageUrl}
                        alt={lesson.title}
                        className="max-w-full h-auto object-contain rounded-lg mb-6 shadow-md max-h-[75vh] mx-auto block" // <-- MODIFICAT AICI
                    />
                )}

                {lessonAudioUrl && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Înregistrarea Lecției (Admin)</h2>
                        <audio controls src={lessonAudioUrl} className="w-full rounded-lg"></audio>
                    </div>
                )}

                {/* Conținutul complet al lecției (din TinyMCE, creat de admin) */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lesson.theoryContent }}>
                </div>
            </div>

            {/* SECȚIUNEA PENTRU ÎNREGISTRAREA AUDIO A UTILIZATORULUI */}
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Încarcă-ți Înregistrarea</h2>
                <p className="text-gray-700 mb-4">
                    Exersează ce ai învățat și încarcă-ți propria înregistrare audio pentru feedback sau pentru a-ți monitoriza progresul.
                </p>

                {recordingError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Eroare la încărcare:</strong>
                    <span className="block sm:inline"> {recordingError}</span>
                </div>}

                <form onSubmit={handleUserRecordingSubmit}>
                    <div className="mb-6">
                        <label htmlFor="userRecording" className="block text-lg font-medium text-gray-700 mb-2">
                            Selectează Înregistrarea Ta Audio
                        </label>
                        <input
                            type="file"
                            id="userRecording"
                            accept="audio/*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
                            onChange={handleUserRecordingChange}
                            required
                        />
                        {userRecording && (
                            <p className="mt-2 text-sm text-gray-600">Fișier selectat: {userRecording.name}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                        disabled={uploadingRecording}
                    >
                        {uploadingRecording ? 'Se încarcă...' : 'Trimite Înregistrarea Mea'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LessonDetail;
