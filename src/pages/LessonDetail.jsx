import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated, logout } = useContext(AuthContext);

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Stări noi pentru QUIZ ---
    const [quiz, setQuiz] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: "selectedOptionText" }
    const [quizSubmitted, setQuizSubmitted] = useState(false); // Indică dacă utilizatorul a trimis deja quiz-ul
    const [quizResult, setQuizResult] = useState(null); // Rezultatul primit de la backend după submitere

    // Stări pentru înregistrarea audio directă (microfon) SAU selectarea unui fișier temporar
    const [isRecording, setIsRecording] = useState(false);
    const [tempPreviewAudioURL, setTempPreviewAudioURL] = useState(null); // URL pentru redarea înregistrării/fișierului TEMPORAR
    const [tempPreviewAudioBlob, setTempPreviewAudioBlob] = useState(null); // Blob-ul fișierului audio (doar pentru înregistrare directă)
    const [tempUserSelectedFile, setTempUserSelectedFile] = useState(null); // Fișierul selectat de utilizator TEMPORAR

    // Stări pentru cea mai recentă înregistrare SALVATĂ (preluată din DB)
    const [lastSavedAudioURL, setLastSavedAudioURL] = useState(null);
    const [lastSavedAudioName, setLastSavedAudioName] = useState(null); // Pentru afișarea numelui fișierului salvat
    const [lastSavedRecordingId, setLastSavedRecordingId] = useState(null); // NOU: ID-ul înregistrării salvate

    const [recordingError, setRecordingError] = useState(null); // Mesaj de eroare general pentru înregistrare/upload
    const [uploadingRecording, setUploadingRecording] = useState(false);

    const [fetchingUserRecordings, setFetchingUserRecordings] = useState(false);
    const [deletingRecording, setDeletingRecording] = useState(false); // NOU: Stare pentru a indica ștergerea

    // Referințe pentru MediaRecorder
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // Funcție pentru a prelua înregistrarea utilizatorului pentru această lecție
    // Va prelua doar o singură înregistrare (cea mai recentă)
    const fetchUserRecordingForLesson = useCallback(async () => {
        if (!isAuthenticated || !token || !id) {
            setLastSavedAudioURL(null);
            setLastSavedAudioName(null);
            setLastSavedRecordingId(null);
            setFetchingUserRecordings(false);
            return;
        }
        setFetchingUserRecordings(true);
        try {
            console.log(`FRONTEND DEBUG (LessonDetail): Se preia înregistrarea utilizatorului pentru lecția ${id}`);
            const response = await axios.get(`http://localhost:3000/api/user-recordings/${id}/my-recordings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const fetchedRecordings = response.data.data;
            // Presupunem că backend-ul returnează maxim o înregistrare sau un array gol
            if (fetchedRecordings.length > 0) {
                const mostRecentRecording = fetchedRecordings[0];
                setLastSavedAudioURL(`http://localhost:3000${mostRecentRecording.audioUrl}`);
                setLastSavedAudioName(`Înregistrare salvată: ${new Date(mostRecentRecording.createdAt).toLocaleDateString()}`);
                setLastSavedRecordingId(mostRecentRecording.id); // Setează ID-ul înregistrării salvate
            } else {
                setLastSavedAudioURL(null);
                setLastSavedAudioName(null);
                setLastSavedRecordingId(null);
            }

        } catch (err) {
            console.error('FRONTEND ERROR (LessonDetail): Eroare la preluarea înregistrării specifice lecției:', err);
            setLastSavedAudioURL(null);
            setLastSavedAudioName(null);
            setLastSavedRecordingId(null);
        } finally {
            setFetchingUserRecordings(false);
        }
    }, [id, isAuthenticated, token]);

    useEffect(() => {
        if (isAuthenticated && id) {
            fetchUserRecordingForLesson();
        }
    }, [isAuthenticated, id, fetchUserRecordingForLesson]);

    // --- Funcții pentru înregistrarea audio directă (microfon) ---
    const startRecording = async () => {
        if (tempPreviewAudioURL && tempPreviewAudioURL.startsWith('blob:')) {
            URL.revokeObjectURL(tempPreviewAudioURL);
        }
        setTempUserSelectedFile(null);
        setTempPreviewAudioURL(null);
        setTempPreviewAudioBlob(null);
        setRecordingError(null);
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioURL = URL.createObjectURL(audioBlob);
                setTempPreviewAudioURL(audioURL);
                setTempPreviewAudioBlob(audioBlob);
                setIsRecording(false);

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                setRecordingError(`Eroare la înregistrare: ${event.error.name || event.error}`);
                setIsRecording(false);
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            console.log('Înregistrare începută...');

        } catch (err) {
            console.error('Eroare la accesarea microfonului:', err);
            setRecordingError('Nu s-a putut accesa microfonul. Asigură-te că ai permis accesul.');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('Înregistrare oprită.');
        }
    };

    // --- Funcția pentru încărcarea unui fișier existent ---
    const handleUserSelectedFileChange = (e) => {
        if (tempPreviewAudioURL && tempPreviewAudioURL.startsWith('blob:')) {
            URL.revokeObjectURL(tempPreviewAudioURL);
        }
        setTempPreviewAudioURL(null);
        setTempPreviewAudioBlob(null);
        setIsRecording(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        const file = e.target.files[0];
        setTempUserSelectedFile(file);
        setRecordingError(null);

        if (file) {
            setTempPreviewAudioURL(URL.createObjectURL(file));
        }
    };

    // Funcția care resetează stările TEMPORARE de înregistrare/încărcare
    const resetTemporaryRecordingOptions = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsRecording(false);

        if (tempPreviewAudioURL && tempPreviewAudioURL.startsWith('blob:')) {
            URL.revokeObjectURL(tempPreviewAudioURL);
        }
        setTempPreviewAudioURL(null);
        setTempPreviewAudioBlob(null);
        setTempUserSelectedFile(null);
        setRecordingError(null);
        audioChunksRef.current = [];
        console.log('Opțiunile de înregistrare/încărcare temporare au fost resetate.');
        // După resetare, forțăm o re-preluare pentru a afișa ultima înregistrare salvată din DB, dacă există.
        fetchUserRecordingForLesson();
    };

    // --- Funcție pentru upload-ul înregistrării utilizatorului (ambele opțiuni) ---
    const handleUserRecordingSubmit = async (e) => {
        e.preventDefault();
        setUploadingRecording(true);
        setRecordingError(null);

        let fileToUpload = null;

        // CORECTAT: Folosim tempPreviewAudioBlob, nu recordedAudioBlob
        if (tempPreviewAudioBlob) {
            fileToUpload = new File([tempPreviewAudioBlob], `recording-${Date.now()}.webm`, { type: tempPreviewAudioBlob.type });
        } else if (tempUserSelectedFile) {
            fileToUpload = tempUserSelectedFile;
        } else {
            setRecordingError("Te rog înregistrează o cântare sau selectează un fișier audio.");
            setUploadingRecording(false);
            return;
        }

        if (!isAuthenticated) {
            setRecordingError('Nu ești autentificat. Te rog loghează-te pentru a încărca înregistrări.');
            setUploadingRecording(false);
            logout();
            navigate('/login');
            return;
        }

        if (!id) {
            setRecordingError('Eroare: ID-ul lecției lipsește. Nu se poate încărca înregistrarea.');
            setUploadingRecording(false);
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', fileToUpload);

        console.log("FRONTEND: Se pregătește înregistrarea utilizatorului pentru trimitere...");

        try {
            const response = await axios.post(`http://localhost:3000/api/user-recordings/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            console.log('FRONTEND: Înregistrarea utilizatorului a fost salvată cu succes:', response.data);
            setRecordingError('Înregistrarea ta a fost salvată cu succes!');

            if (tempPreviewAudioURL && tempPreviewAudioURL.startsWith('blob:')) {
                URL.revokeObjectURL(tempPreviewAudioURL);
            }
            setTempPreviewAudioURL(null);
            setTempPreviewAudioBlob(null);
            setTempUserSelectedFile(null);

            // Reîmprospătăm starea înregistrării salvate (va prelua noua înregistrare)
            fetchUserRecordingForLesson();

        } catch (error) {
            console.error('FRONTEND ERROR: Eroare la trimiterea înregistrării utilizatorului:', error);
            if (error.response) {
                console.error('FRONTEND DEBUG: Data eroare:', error.response.data);
                console.error('FRONTEND DEBUG: Status eroare:', error.response.status);
                setRecordingError(error.response.data.message || error.response.data.error || 'Server error');
                if (error.response.status === 401 || error.response.status === 403) {
                    setRecordingError('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                    logout();
                    navigate('/login');
                }
            } else if (error.request) {
                console.error('FRONTEND ERROR: Niciun răspuns de la server:', error.request);
                setRecordingError('Nu s-a putut conecta la server pentru a trimite înregistrarea. Verifică conexiunea.');
            } else {
                console.error('FRONTEND ERROR: Eroare la configurarea cererii:', error.message);
                setRecordingError(`A apărut o eroare: ${error.message}`);
            }
        } finally {
            setUploadingRecording(false);
        }
    };

    // Funcție pentru ștergerea înregistrării utilizatorului
    const handleDeleteUserRecording = async () => {
        if (!lastSavedRecordingId) {
            setRecordingError('Nu există nicio înregistrare salvată de șters.');
            return;
        }
        if (!window.confirm('Ești sigur că vrei să ștergi înregistrarea ta pentru această lecție? Această acțiune este ireversibilă.')) {
            return;
        }

        if (!isAuthenticated || !token) {
            setRecordingError('Nu sunteți autentificat pentru a șterge înregistrări.');
            logout();
            navigate('/login');
            return;
        }

        setDeletingRecording(true);
        try {
            console.log(`FRONTEND DEBUG (LessonDetail): Se șterge înregistrarea utilizatorului cu ID: ${lastSavedRecordingId}`);
            await axios.delete(`http://localhost:3000/api/user-recordings/${lastSavedRecordingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`FRONTEND DEBUG (LessonDetail): Înregistrarea ${lastSavedRecordingId} ștearsă cu succes.`);
            setRecordingError('Înregistrarea a fost ștearsă cu succes!');

            // După ștergere, curățăm player-ul de sus
            setLastSavedAudioURL(null);
            setLastSavedAudioName(null);
            setLastSavedRecordingId(null);
            // resetTemporaryRecordingOptions(); // Ar putea fi apelat dacă vrei să resetezi și opțiunile de înregistrare

        } catch (err) {
            console.error('FRONTEND ERROR (LessonDetail): Eroare la ștergerea înregistrării utilizatorului:', err);
            setRecordingError(err.response?.data?.message || 'Eroare la ștergerea înregistrării.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
                navigate('/login');
            }
        } finally {
            setDeletingRecording(false);
        }
    };

    // --- Preluarea datelor lecției ȘI a quiz-ului (LOGICĂ MODIFICATĂ) ---
    useEffect(() => {
        const fetchLessonAndQuiz = async () => {
            setLoading(true);
            setQuizLoading(true); // Începe încărcarea pentru quiz odată cu lecția
            setError(null);
            setQuizError(null);
            setQuiz(null); // Resetăm quiz-ul la fiecare reîncărcare

            if (!id) {
                setError("ID-ul lecției lipsește din URL.");
                setLoading(false);
                setQuizLoading(false);
                return;
            }

            try {
                // 1. Preluarea lecției
                const lessonResponse = await axios.get(`http://localhost:3000/api/lessons/${id}`);
                setLesson(lessonResponse.data.data);

                // 2. Preluarea quiz-ului asociat lecției
                try {
                    const quizResponse = await axios.get(`http://localhost:3000/api/quizzes/by-lesson/${id}`);
                    setQuiz(quizResponse.data); // Backend-ul returnează direct obiectul quiz
                    // Dacă quiz-ul are deja răspunsuri, poți seta quizSubmitted și quizResult aici,
                    // dar pentru prima iterație, presupunem că utilizatorul răspunde la un quiz nou.
                } catch (quizErr) {
                    // E ok dacă nu există un quiz pentru lecție (status 404)
                    if (quizErr.response && quizErr.response.status === 404) {
                        setQuiz(null); // Nu există quiz, setăm la null
                        console.log(`FRONTEND DEBUG: Nu există quiz pentru lecția ${id}.`);
                    } else {
                        console.error("FRONTEND ERROR: Eroare la preluarea quiz-ului:", quizErr);
                        setQuizError("Nu s-a putut încărca quiz-ul.");
                    }
                }
            } catch (err) {
                console.error("FRONTEND ERROR: Eroare la preluarea lecției:", err);
                setError("Nu s-a putut încărca lecția. Te rog încearcă din nou.");
            } finally {
                setLoading(false);
                setQuizLoading(false);
            }
        };

        fetchLessonAndQuiz();
    }, [id]); // Rulăm efectul când ID-ul lecției se schimbă

    // --- Logica Quiz-ului ---
    const handleAnswerChange = (questionIndex, option) => {
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionIndex]: option, // Stocăm opțiunea selectată pentru indexul întrebării
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!isAuthenticated || !token) {
            alert('Te rog loghează-te pentru a trimite răspunsurile la quiz.');
            logout();
            navigate('/login');
            return;
        }

        if (!quiz || !quiz.questions) {
            alert('Nu există un quiz valid de trimis.');
            return;
        }

        // Verificăm dacă toate întrebările au primit un răspuns
        if (Object.keys(userAnswers).length !== quiz.questions.length) {
            alert("Te rog răspunde la toate întrebările înainte de a trimite.");
            return;
        }

        try {
            // Aici vei trimite răspunsurile către backend.
            // Presupunem că ai un endpoint pentru asta, de exemplu:
            // POST /api/user-completed-quizzes/submit
            // Backend-ul va verifica răspunsurile și va returna un scor/feedback.
            const submissionData = {
                quizId: quiz.id,
                lessonId: id, // Asigură-te că trimiți lessonId
                userAnswers: userAnswers, // { "0": "Opțiunea A", "1": "Opțiunea B" }
            };

            const response = await axios.post(`http://localhost:3000/api/user-completed-quizzes/submit`, submissionData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            setQuizResult(response.data); // Aici vei primi scorul/feedback-ul de la backend
            setQuizSubmitted(true);
            alert("Răspunsurile tale au fost trimise cu succes!");

        } catch (err) {
            console.error("FRONTEND ERROR: Eroare la trimiterea răspunsurilor quiz-ului:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'A apărut o eroare la trimiterea răspunsurilor. Te rog încearcă din nou.';
            alert(errorMessage);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
                navigate('/login');
            }
        }
    };

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

    // Determină ce URL audio să afișăm în player-ul de sus
    const currentAudioForTopPlayer = tempPreviewAudioURL || lastSavedAudioURL;
    // Determină numele audio-ului pentru afișare
    const currentAudioNameForTopPlayer = tempUserSelectedFile?.name ? `Fișier selectat: ${tempUserSelectedFile.name}` :
        tempPreviewAudioBlob ? 'Înregistrare nouă (neînregistrată)' :
            lastSavedAudioName || 'Audio';

    return (
        <div className="container mx-auto p-6">
            {/* Secțiunea de detalii a lecției (conținut admin) */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{lesson.title}</h1>

                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: lesson.theoryContent }}>
                </div>

                {sheetMusicImageUrl && (
                    <img
                        src={sheetMusicImageUrl}
                        alt={lesson.title}
                        className="max-w-full h-auto object-contain rounded-lg mb-6 shadow-md max-h-[75vh] mx-auto block"
                    />
                )}

                {lessonAudioUrl && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Înregistrarea Lecției (Admin)</h2>
                        <audio controls src={lessonAudioUrl} className="w-full rounded-lg"></audio>
                    </div>
                )}
            </div>

            {/* SECȚIUNEA PENTRU ÎNREGISTRAREA AUDIO A UTILIZATORULUI */}
            {isAuthenticated ? (
                <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Adaugă-ți Înregistrarea</h2>
                    <p className="text-gray-700 mb-4">
                        Înregistrează-ți sau încarcă-ți cântarea pentru această lecție. Aceasta va înlocui orice înregistrare existentă.
                    </p>

                    {recordingError && (
                        <div className={`px-4 py-3 rounded relative mb-4 ${recordingError.includes('salvată cu succes') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} role="alert">
                            <strong className="font-bold">{recordingError.includes('salvată cu succes') ? 'Succes:' : 'Eroare la încărcare:'}</strong>
                            <span className="block sm:inline"> {recordingError}</span>
                        </div>
                    )}

                    {/* Interfața de înregistrare sau încărcare fișier */}
                    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50 mb-6">
                        {/* Afișăm opțiunile de pornire înregistrare/încărcare fișier DOAR dacă nu e înregistrare activă
                            și NU există audio pregătit TEMPORAR și NU există audio SALVAT care să fie afișat */}
                        {!isRecording && !tempPreviewAudioURL && !lastSavedAudioURL && (
                            <div className="w-full flex flex-col items-center mb-4">
                                <button
                                    onClick={startRecording}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-200 shadow-md flex items-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                    <span>Începe Înregistrarea Cu Microfonul</span>
                                </button>
                                <p className="text-gray-600 mt-3 text-sm">Sau</p>
                            </div>
                        )}

                        {isRecording && (
                            <div className="w-full flex flex-col items-center mb-4">
                                <button
                                    onClick={stopRecording}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-200 shadow-md flex items-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    <span>Oprește Înregistrarea</span>
                                </button>
                                <p className="text-gray-600 mt-3 text-sm">Înregistrare activă...</p>
                            </div>
                        )}

                        {!isRecording && !tempPreviewAudioURL && !lastSavedAudioURL && (
                            <div className="w-full flex flex-col items-center">
                                <label htmlFor="userAudioFile" className="block text-lg font-medium text-gray-700 mb-2">
                                    Selectează Fișier Audio
                                </label>
                                <input
                                    type="file"
                                    id="userAudioFile"
                                    accept="audio/*"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-blue-700 hover:file:bg-gray-200"
                                    onChange={handleUserSelectedFileChange}
                                />
                            </div>
                        )}

                        {/* Player și butoane de acțiune pentru audio pregătit (fie temporar, fie ultimul salvat) */}
                        {(currentAudioForTopPlayer && !isRecording) && (
                            <div className="w-full mt-4 flex flex-col items-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentAudioNameForTopPlayer}</h3>
                                <audio controls src={currentAudioForTopPlayer} className="w-full max-w-md rounded-lg mb-2"></audio>

                                <div className="mt-4 space-x-4 flex justify-center"> {/* Centram butoanele */}
                                    {/* Butonul de salvare apare doar dacă există o înregistrare temporară, nesalvată */}
                                    {(tempPreviewAudioBlob || tempUserSelectedFile) ? (
                                        <button
                                            onClick={handleUserRecordingSubmit}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                                            disabled={uploadingRecording}
                                        >
                                            {uploadingRecording ? 'Se încarcă...' : 'Salvează Înregistrarea'}
                                        </button>
                                    ) : (
                                        // Butonul de ștergere apare doar dacă există o înregistrare salvată
                                        lastSavedRecordingId && (
                                            <button
                                                onClick={handleDeleteUserRecording}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                                                disabled={deletingRecording}
                                            >
                                                {deletingRecording ? 'Se șterge...' : 'Șterge Înregistrarea Curentă'}
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={resetTemporaryRecordingOptions}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition duration-200 shadow-md"
                                    >
                                        Înregistrează Nouă / Resetează
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Adaugă-ți Înregistrarea</h2>
                    <p className="text-gray-700 mb-4">
                        Pentru a înregistra și încărca o cântare, te rog să te autentifici.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors duration-300"
                    >
                        Mergi la Login
                    </button>
                </div>
            )}

            {/* Mesaj dacă nu există înregistrări și utilizatorul este autentificat */}
            {isAuthenticated && !currentAudioForTopPlayer && !fetchingUserRecordings && !isRecording && (
                <div className="bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
                    <p className="text-xl text-gray-700">Nu ai încă o înregistrare pentru această lecție.</p>
                    <p className="text-gray-600">Folosește interfața de mai sus pentru a înregistra prima ta cântare!</p>
                </div>
            )}

            {/* AICI MUTĂM SECȚIUNEA DE QUIZ */}
            {isAuthenticated && (
                <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Quiz pentru Lecție</h2>
                    {quizLoading ? (
                        <p className="text-gray-700 text-center">Se încarcă quiz-ul...</p>
                    ) : quizError ? (
                        <p className="text-red-500 text-center">{quizError}</p>
                    ) : quiz ? (
                        <div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">{quiz.title}</h3>
                            {quiz.description && <p className="mb-4 text-gray-600">{quiz.description}</p>}

                            {quiz.questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-gray-100 p-5 rounded-lg shadow-sm mb-4">
                                    <p className="font-medium text-lg text-gray-900 mb-3">{qIndex + 1}. {q.questionText}</p>
                                    {q.imageUrl && (
                                        <img src={`http://localhost:3000${q.imageUrl}`} alt="Imagine întrebare" className="max-w-xs h-auto mb-4 rounded-md shadow-sm" />
                                    )}
                                    <div className="flex flex-col space-y-2">
                                        {q.options.map((option, oIndex) => (
                                            <label key={oIndex} className="inline-flex items-center text-gray-700 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`question-${qIndex}`}
                                                    value={option}
                                                    checked={userAnswers[qIndex] === option}
                                                    onChange={() => handleAnswerChange(qIndex, option)}
                                                    disabled={quizSubmitted} // Dezactivează input-urile după trimitere
                                                    className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-base">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {!quizSubmitted && (
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
                                >
                                    Trimite Răspunsuri
                                </button>
                            )}

                            {quizResult && (
                                <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-semibold shadow-inner">
                                    <h3 className="text-xl font-bold mb-2">Rezultatele Tale:</h3>
                                    <p className="text-lg">{quizResult.message || JSON.stringify(quizResult)}</p>
                                    {/* Poți afișa mai multe detalii dacă backend-ul le oferă, ex: număr corect, răspunsuri greșite */}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center">Nu există un quiz disponibil pentru această lecție.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LessonDetail;

