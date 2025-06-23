import React, { useState, useRef, useEffect, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import QuizEditor from '../components/QuizEditor'; // Importă noua componentă

const LessonForm = () => {
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = id && id !== 'new' && id !== 'create';

    const { token, isAuthenticated, user, logout } = useContext(AuthContext);

    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonOrder, setLessonOrder] = useState('');
    const [editorContent, setEditorContent] = useState('');

    const [sheetMusicImage, setSheetMusicImage] = useState(null);
    const [lessonAudio, setLessonAudio] = useState(null);

    const [existingSheetMusicImageUrl, setExistingSheetMusicImageUrl] = useState('');
    const [existingAudioUrl, setExistingAudioUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // --- Stări pentru QUIZ (rămân aici pentru a le transmite ca props) ---
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [existingQuizId, setExistingQuizId] = useState(null);
    const [quizSaving, setQuizSaving] = useState(false);
    const [quizError, setQuizError] = useState(null);

    // Efect pentru preluarea datelor lecției ȘI QUIZ-ULUI în modul de editare
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            alert('Nu ai permisiuni de administrator pentru a accesa această pagină. Te rog loghează-te ca admin.');
            navigate('/login');
            return;
        }

        if (isEditMode) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const [lessonResponse, quizResponse] = await Promise.all([
                        axios.get(`http://localhost:3000/api/lessons/${id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        // ASIGURĂ-TE CĂ ACEST ENDPOINT ESTE CORECT PENTRU A PRELUA QUIZ-UL DUPĂ ID-UL LECȚIEI
                        axios.get(`http://localhost:3000/api/quizzes/by-lesson/${id}`, { 
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).catch(err => {
                            console.warn("FRONTEND DEBUG: Nu s-a putut prelua quiz-ul pentru lecție (poate nu există sau acces neautorizat):", err.message);
                            // Dacă nu există quiz, nu e o eroare fatală, continuăm cu null
                            return { data: { data: null } }; 
                        })
                    ]);

                    const lessonData = lessonResponse.data.data;
                    setLessonTitle(lessonData.title || '');
                    setLessonOrder(lessonData.order || '');
                    setEditorContent(lessonData.theoryContent || '');
                    setExistingSheetMusicImageUrl(lessonData.sheetMusicImageUrl || '');
                    setExistingAudioUrl(lessonData.audioUrl || '');

                    if (quizResponse.data && quizResponse.data.data) {
                        const quizData = quizResponse.data.data;
                        setExistingQuizId(quizData.id);
                        setQuizTitle(quizData.title || '');
                        setQuizDescription(quizData.description || '');
                        // Aici procesăm URL-urile imaginilor pentru a se asigura că sunt null (nu 'null' string)
                        setQuizQuestions(quizData.questions.map(q => ({
                            ...q,
                            imageUrl: q.imageUrl === 'null' ? null : q.imageUrl,
                            imageFile: null // Asigură-te că imageFile este null la încărcare
                        })) || []);
                    } else {
                        setExistingQuizId(null);
                        setQuizTitle('');
                        setQuizDescription('');
                        setQuizQuestions([]);
                    }
                } catch (err) {
                    console.error('Eroare la preluarea datelor pentru editare:', err);
                    setError(err.response?.data?.message || 'Nu s-au putut încărca datele pentru editare.');
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                        logout();
                        navigate('/login');
                    } else if (err.response && err.response.status === 404) {
                        setError('Lecția specificată nu a fost găsită.');
                        navigate('/admin/lessons');
                    }
                } finally {
                    setLoading(false);
                    setInitialLoadDone(true);
                }
            };
            fetchData();
        } else {
            setInitialLoadDone(true);
        }
    }, [id, isEditMode, isAuthenticated, user, navigate, token, logout]);

    const handleEditorChange = (content, editor) => {
        // console.log('Content changed:', content);
    };

    const handleSheetMusicImageChange = (e) => {
        setSheetMusicImage(e.target.files[0]);
    };

    const handleLessonAudioChange = (e) => {
        setLessonAudio(e.target.files[0]);
    };

    const handleRemoveSheetMusicImage = () => {
        setSheetMusicImage(null);
        setExistingSheetMusicImageUrl('');
    };

    const handleRemoveLessonAudio = () => {
        setLessonAudio(null);
        setExistingAudioUrl('');
    };

    // --- FUNCTII PENTRU GESTIONAREA QUIZ-ULUI (rămân aici) ---
    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { questionText: '', options: ['', '', ''], correctAnswer: '', imageUrl: null, imageFile: null }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    };

    const handleQuestionTextChange = (index, text) => {
        const newQuestions = [...quizQuestions];
        newQuestions[index].questionText = text;
        setQuizQuestions(newQuestions);
    };

    const handleAddOption = (questionIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options.push('');
        setQuizQuestions(newQuestions);
    };

    const handleRemoveOption = (questionIndex, optionIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        if (newQuestions[questionIndex].correctAnswer === newQuestions[questionIndex].options[optionIndex]) {
            newQuestions[questionIndex].correctAnswer = '';
        }
        setQuizQuestions(newQuestions);
    };

    const handleOptionTextChange = (questionIndex, optionIndex, text) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options[optionIndex] = text;
        setQuizQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (questionIndex, optionText) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].correctAnswer = optionText;
        setQuizQuestions(newQuestions);
    };

    const handleQuestionImageChange = (questionIndex, file) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].imageFile = file; // Stocăm fișierul brut
        newQuestions[questionIndex].imageUrl = file ? URL.createObjectURL(file) : null; // URL temporar pentru preview
        setQuizQuestions(newQuestions);
    };

    const handleRemoveQuestionImage = (questionIndex) => {
        const newQuestions = [...quizQuestions];
        if (newQuestions[questionIndex].imageUrl && newQuestions[questionIndex].imageUrl.startsWith('http')) {
            // Dacă imaginea existentă vine de la server, o marcăm pentru ștergere
            newQuestions[questionIndex].imageUrl = 'null'; // Backend-ul va interpreta 'null' ca o cerere de ștergere
        } else {
            // Dacă e o imagine nouă, doar resetăm starea
            newQuestions[questionIndex].imageUrl = null;
        }
        newQuestions[questionIndex].imageFile = null; // Eliminăm fișierul selectat
        setQuizQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQuizError(null);

        if (!token) {
            setError('Nu ești autentificat. Te rog loghează-te.');
            setLoading(false);
            navigate('/login');
            return;
        }

        let newLessonId = id; // Va fi actualizat dacă e mod de creare

        try {
            // --- PASUL 1: Salvează/Actualizează Lecția (Rămâne cu FormData, e OK) ---
            const lessonFormData = new FormData();
            lessonFormData.append('title', lessonTitle);
            lessonFormData.append('order', lessonOrder);
            lessonFormData.append('theoryContent', editorRef.current ? editorRef.current.getContent() : '');

            if (sheetMusicImage) {
                lessonFormData.append('sheetMusicImage', sheetMusicImage);
            } else if (isEditMode && existingSheetMusicImageUrl === '') {
                lessonFormData.append('sheetMusicImageUrl', 'null'); // Semnalizează backend-ului să șteargă
            }

            if (lessonAudio) {
                lessonFormData.append('audioFile', lessonAudio);
            } else if (isEditMode && existingAudioUrl === '') {
                lessonFormData.append('audioUrl', 'null'); // Semnalizează backend-ului să șteargă
            }

            console.log(`Se pregătesc datele pentru ${isEditMode ? 'actualizare' : 'creare'} lecție.`);

            const lessonConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data', // Rămâne multipart/form-data pentru lecție
                    'Authorization': `Bearer ${token}`
                },
            };

            let lessonResponse;
            if (isEditMode) {
                lessonResponse = await axios.put(`http://localhost:3000/api/lessons/${id}`, lessonFormData, lessonConfig);
                console.log('Lecția a fost actualizată cu succes:', lessonResponse.data);
            } else {
                lessonResponse = await axios.post('http://localhost:3000/api/lessons/create', lessonFormData, lessonConfig);
                console.log('Lecția a fost creată cu succes:', lessonResponse.data);
                newLessonId = lessonResponse.data.data.id; // Obține noul ID al lecției
            }

            // --- PASUL 2: Salvează/Actualizează Quiz-ul (ACUM TRIMITE JSON DIRECT!) ---
            if (quizQuestions.length > 0 || quizTitle) { // Salvează/actualizează quiz doar dacă are conținut
                setQuizSaving(true);
                
                // Construim obiectul quiz-ului pentru a fi trimis ca JSON
                const quizDataToSend = {
                    lessonId: newLessonId, // Folosește ID-ul lecției create/existente
                    title: quizTitle,
                    description: quizDescription,
                    questions: quizQuestions.map(q => {
                        // Creăm o copie a întrebării, eliminând 'imageFile' pentru cererea JSON
                        const { imageFile, ...rest } = q; 
                        return {
                            ...rest,
                            // Aici tratăm 'imageUrl' pentru a fi corect pentru backend:
                            // - 'null' (string) dacă a fost marcată pentru ștergere
                            // - URL-ul existent dacă nu s-a schimbat
                            // - null dacă e o întrebare nouă fără imagine
                            imageUrl: (q.imageUrl === 'null' && !q.imageFile) ? 'null' : (q.imageUrl && !q.imageUrl.startsWith('blob:') ? q.imageUrl : null)
                        };
                    })
                };

                const quizConfig = {
                    headers: {
                        'Content-Type': 'application/json', // <--- ACESTA ESTE ESENȚIAL PENTRU QUIZ!
                        'Authorization': `Bearer ${token}`
                    },
                };
                
                let quizResponse;
                if (existingQuizId) {
                    // Calea pentru ACTUALIZARE QUIZ
                    quizResponse = await axios.put(`http://localhost:3000/api/quizzes/update/${existingQuizId}`, quizDataToSend, quizConfig);
                    console.log('Quiz-ul a fost actualizat cu succes:', quizResponse.data);
                } else {
                    // Calea pentru CREARE QUIZ
                    quizResponse = await axios.post(`http://localhost:3000/api/quizzes/create`, quizDataToSend, quizConfig);
                    console.log('Quiz-ul a fost creat cu succes:', quizResponse.data);
                }

                // --- GESTIONAREA IMAGINILOR PENTRU ÎNTREBĂRI (Dacă vrei să le uploadezi) ---
                // Această parte este lăsată ca un TO-DO.
                // Dacă ai întrebări cu imagini noi (q.imageFile nu e null), va trebui să le uploadezi separat.
                // Acest lucru implică un alt apel API cu FormData către un endpoint dedicat
                // care folosește Multer pe backend pentru a salva imaginile și a le asocia cu întrebările.
                // Nu am inclus implementarea aici pentru a menține focusul pe problema JSON,
                // dar reține că e un pas necesar dacă imaginile sunt parte din quiz.
                const questionsWithNewImages = quizQuestions.filter(q => q.imageFile);
                if (questionsWithNewImages.length > 0) {
                    console.warn("ATENȚIE: Imaginile pentru întrebări din quiz nu sunt încă gestionate de acest flux. Va trebui să implementezi un upload separat pentru ele.");
                    // Exemplu de cum ai putea face asta (nu e complet, doar o idee):
                    // const imageUploadFormData = new FormData();
                    // questionsWithNewImages.forEach((q, index) => {
                    //     imageUploadFormData.append(`questionImage_${index}`, q.imageFile);
                    // });
                    // // Aici ar trebui un apel către un API de upload de imagini separat
                    // const uploadImageResponse = await axios.post('http://localhost:3000/api/quiz-question-images/upload', imageUploadFormData, {
                    //     headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
                    // });
                    // // După upload, vei primi URL-urile noi și va trebui să faci un alt PUT la quiz cu URL-urile actualizate.
                }

                setQuizSaving(false);
            } else {
                 console.log("Nu există date pentru quiz de salvat/actualizat. Sărit pasul de salvare quiz.");
            }

            // Redirecționează după ce ambele salvări sunt complete
            navigate('/admin/lessons');
        } catch (error) {
            console.error('Eroare la salvarea lecției sau a quiz-ului:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                // Încearcă să extragi mesajul de eroare specific de la backend
                const errorMessage = error.response.data.message || error.response.data.error || 'Eroare la salvarea datelor.';
                setError(errorMessage);
                setQuizError(errorMessage); // Afișează eroarea și la secțiunea de quiz

                if (error.response.status === 401 || error.response.status === 403) {
                    alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                    logout();
                    navigate('/login');
                }
            } else if (error.request) {
                console.error('Niciun răspuns de la server:', error.request);
                setError('Nu s-a putut conecta la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                console.error('Eroare la configurarea cererii:', error.message);
                setError(`A apărut o eroare: ${error.message}`);
            }
            setQuizSaving(false);
        } finally {
            setLoading(false);
        }
    };

    if (isEditMode && !initialLoadDone) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă datele lecției și ale quiz-ului pentru editare...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-xl shadow-lg my-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {isEditMode ? 'Editează Lecție' : 'Adaugă Lecție Nouă'} (Admin)
            </h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Eroare:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Secțiunea pentru detalii lecție */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalii Lecție</h2>
                    <div className="mb-6">
                        <label htmlFor="lessonTitle" className="block text-lg font-medium text-gray-700 mb-2">
                            Titlul Lecției
                        </label>
                        <input
                            type="text"
                            id="lessonTitle"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="lessonOrder" className="block text-lg font-medium text-gray-700 mb-2">
                            Ordinea Lecției
                        </label>
                        <input
                            type="number"
                            id="lessonOrder"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                            value={lessonOrder}
                            onChange={(e) => setLessonOrder(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="sheetMusicImage" className="block text-lg font-medium text-gray-700 mb-2">
                            Imaginea Partiturii (opțional)
                        </label>
                        {isEditMode && existingSheetMusicImageUrl && !sheetMusicImage ? (
                            <div className="flex flex-col items-center justify-center space-y-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <img
                                    src={`http://localhost:3000${existingSheetMusicImageUrl}`}
                                    alt="Partitură existentă"
                                    className="max-w-full h-auto object-contain rounded-lg shadow-md border border-gray-300 max-h-[75vh]"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveSheetMusicImage}
                                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors duration-300"
                                >
                                    Șterge Imaginea Curentă
                                </button>
                            </div>
                        ) : isEditMode && existingSheetMusicImageUrl === '' && !sheetMusicImage && initialLoadDone ? (
                            <p className="text-sm text-gray-500 mb-2">Nu există imagine curentă.</p>
                        ) : null}

                        <input
                            type="file"
                            id="sheetMusicImage"
                            accept="image/*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
                            onChange={handleSheetMusicImageChange}
                        />
                        {sheetMusicImage && (
                            <p className="mt-2 text-sm text-gray-600">Fișier imagine nou selectat: {sheetMusicImage.name}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="lessonAudio" className="block text-lg font-medium text-gray-700 mb-2">
                            Fișier Audio Lecție (opțional)
                        </label>
                        {isEditMode && existingAudioUrl && !lessonAudio ? (
                            <div className="flex items-center space-x-4 mb-3">
                                <audio controls src={`http://localhost:3000${existingAudioUrl}`} className="w-64 rounded-lg"></audio>
                                <button
                                    type="button"
                                    onClick={handleRemoveLessonAudio}
                                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors duration-300"
                                >
                                    Șterge Audio Curent
                                </button>
                            </div>
                        ) : isEditMode && existingAudioUrl === '' && !lessonAudio && initialLoadDone ? (
                            <p className="text-sm text-gray-500 mb-2">Nu există fișier audio curent.</p>
                        ) : null}

                        <input
                            type="file"
                            id="lessonAudio"
                            accept="audio/*"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
                            onChange={handleLessonAudioChange}
                        />
                        {lessonAudio && (
                            <p className="mt-2 text-sm text-gray-600">Fișier audio nou selectat: {lessonAudio.name}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Conținut Complet al Lecției
                        </label>
                        <Editor
                            apiKey="atlitew2hlznfbyyagqstfbqnds6ued0xcoqtkcp4r57yypq"
                            onInit={(evt, editor) => {
                                editorRef.current = editor;
                                editor.dom.setStyle(editor.dom.select('body')[0], 'direction', 'ltr');
                                editor.dom.setStyle(editor.dom.select('body')[0], 'text-align', 'left');
                            }}
                            initialValue={editorContent || "<p>Începe să scrii conținutul lecției aici...</p>"}
                            onEditorChange={handleEditorChange}
                            init={{
                                height: 500,
                                menubar: false,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                                    'directionality'
                                ],
                                toolbar: 'ltr rtl | undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help',
                                content_style: `
                                    body {
                                        font-family:Helvetica,Arial,sans-serif;
                                        font-size:16px;
                                        direction: ltr;
                                        text-align: left;
                                    }
                                `,
                                directionality: 'ltr',
                                placeholder: 'Începe să scrii conținutul lecției aici...'
                            }}
                        />
                    </div>
                </div> {/* Sfarsit sectiune Detalii Lecție */}

                {/* SECȚIUNEA PENTRU GESTIONAREA QUIZ-ULUI - ACUM CA O COMPONENTĂ SEPARATĂ */}
                <QuizEditor
                    quizTitle={quizTitle}
                    setQuizTitle={setQuizTitle}
                    quizDescription={quizDescription}
                    setQuizDescription={setQuizDescription}
                    quizQuestions={quizQuestions}
                    setQuizQuestions={setQuizQuestions}
                    quizError={quizError}
                    handleAddQuestion={handleAddQuestion}
                    handleRemoveQuestion={handleRemoveQuestion}
                    handleQuestionTextChange={handleQuestionTextChange}
                    handleAddOption={handleAddOption}
                    handleRemoveOption={handleRemoveOption}
                    handleOptionTextChange={handleOptionTextChange}
                    handleCorrectAnswerChange={handleCorrectAnswerChange}
                    handleQuestionImageChange={handleQuestionImageChange}
                    handleRemoveQuestionImage={handleRemoveQuestionImage}
                />

                {/* Butonul de submit final */}
                <button
                    type="submit"
                    className="w-full bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300 mt-8"
                    disabled={loading || quizSaving}
                >
                    {loading || quizSaving ? 'Se salvează...' : (isEditMode ? 'Actualizează Lecția și Quiz-ul' : 'Salvează Lecția și Quiz-ul')}
                </button>
            </form>
        </div>
    );
};

export default LessonForm;