// src/pages/LessonDetail.jsx
import React, { useState, useEffect, useContext } from 'react'; // <-- NOU: Adaugă useContext
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // <-- NOU: Importă AuthContext-ul tău

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useContext(AuthContext); // <-- NOU: Preia token-ul și starea de autentificare

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stare pentru înregistrarea audio a utilizatorului
    const [userRecording, setUserRecording] = useState(null);
    const [uploadingRecording, setUploadingRecording] = useState(false); // Stare pentru încărcare
    const [recordingError, setRecordingError] = useState(null); // Stare pentru erorile de înregistrare

    // Funcție pentru gestionarea selecției fișierului audio de către utilizator
    const handleUserRecordingChange = (e) => {
        setUserRecording(e.target.files[0]);
    };

    // Funcție pentru a trimite înregistrarea utilizatorului către backend
    const handleUserRecordingSubmit = async (e) => {
        e.preventDefault();
        setUploadingRecording(true); // Începe încărcarea
        setRecordingError(null);     // Resetează erorile

        if (!userRecording) {
            alert("Te rog selectează un fișier audio pentru înregistrare.");
            setUploadingRecording(false);
            return;
        }

        // NOU: Verifică token-ul înainte de a trimite înregistrarea
        if (!token) {
            setRecordingError('Nu ești autentificat. Te rog loghează-te pentru a încărca înregistrări.');
            setUploadingRecording(false);
            navigate('/login');
            return;
        }

        const formData = new FormData();
        // Backend-ul tău se așteaptă la 'audioFile' pentru ruta /:id/upload-audio
        formData.append('audioFile', userRecording); // <-- Modificat: Numele câmpului 'audioFile'
        // Nu mai e necesar 'lessonId' aici, deoarece ID-ul lecției e în URL-ul rutei backend-ului

        console.log("Se pregătește înregistrarea utilizatorului pentru trimitere...");
        
        try {
            // URL-ul backend-ului pentru upload audio specific unei lecții este /api/lessons/:id/upload-audio
            // (Conform lessonRoutes.ts)
            const response = await axios.post(`http://localhost:3000/api/lessons/${id}/upload-audio`, formData, { // <-- Modificat URL-ul
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // <-- NOU: Adaugă token-ul de autentificare
                },
                // withCredentials: true // De obicei nu e necesar pentru JWT, doar pentru cookie-uri
            });

            console.log('Înregistrarea utilizatorului a fost trimisă cu succes:', response.data);
            alert('Înregistrarea ta a fost trimisă cu succes!');
            setUserRecording(null); // Resetăm câmpul de înregistrare
            // Dacă vrei să actualizezi UI-ul cu noua înregistrare a lecției, ar trebui să faci o nouă cerere GET
            // sau să actualizezi starea `lesson` cu noul `audioUrl` dacă backend-ul îl returnează.
            // Pentru simplitate, momentan nu facem asta, dar e un punct de îmbunătățire.

        } catch (error) {
            console.error('Eroare la trimiterea înregistrării utilizatorului:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                setRecordingError(error.response.data.message || error.response.data.error || 'Server error');
                 if (error.response.status === 401 || error.response.status === 403) {
                    alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                    // logout(); // Deconectează utilizatorul din frontend (dacă e cazul)
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
            setUploadingRecording(false); // Oprește încărcarea
        }
    };

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/lessons/${id}`);
                // CORECȚIE AICI: Accesează proprietatea 'data' care conține obiectul lecției
                setLesson(response.data.data); // <-- Modificat aici!
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

    // CORECȚIE AICI: Construim URL-urile complete pentru fișierele servite de backend cu portul 3000
    // Asigură-te că `sheetMusicImageUrl` și `audioUrl` vin de la backend cu căi relative corecte (ex: /uploads/lessons/...)
    const sheetMusicImageUrl = lesson.sheetMusicImageUrl
        ? `http://localhost:3000${lesson.sheetMusicImageUrl}` // <-- Adăugat http://localhost:3000
        : null;

    const lessonAudioUrl = lesson.audioUrl
        ? `http://localhost:3000${lesson.audioUrl}` // <-- Adăugat http://localhost:3000
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
                        className="w-full h-80 object-contain rounded-lg mb-6 shadow-md"
                    />
                )}

                {lessonAudioUrl && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Înregistrarea Lecției (Admin)</h2>
                        <audio controls src={lessonAudioUrl} className="w-full rounded-lg"></audio>
                    </div>
                )}

                {/* Conținutul complet al lecției (din TinyMCE, creat de admin) */}
                {/* Asigură-te că prose și prose-lg sunt clase TailwindCSS definite (ex: @tailwindcss/typography) */}
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
                        disabled={uploadingRecording} // Dezactivează butonul în timpul încărcării
                    >
                        {uploadingRecording ? 'Se încarcă...' : 'Trimite Înregistrarea Mea'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LessonDetail;