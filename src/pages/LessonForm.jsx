import React, { useState, useRef, useEffect, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LessonForm = () => {
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams(); 
    
    // Determina daca este modul de editare pe baza ID-ului din URL
    const isEditMode = id && id !== 'new' && id !== 'create'; 
    
    const { token, isAuthenticated, user, logout } = useContext(AuthContext);

    // Stari pentru campurile formularului lectiei
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonOrder, setLessonOrder] = useState('');
    const [editorContent, setEditorContent] = useState(''); 

    // Stari pentru fisierele noi de incarcat (partitura si audio)
    const [sheetMusicImage, setSheetMusicImage] = useState(null);
    const [lessonAudio, setLessonAudio] = useState(null);
    
    // Stari pentru URL-urile existente ale fisierelor (in modul editare)
    const [existingSheetMusicImageUrl, setExistingSheetMusicImageUrl] = useState('');
    const [existingAudioUrl, setExistingAudioUrl] = useState('');

    // Stari pentru gestionarea UI-ului formularului lectiei
    const [loading, setLoading] = useState(false); // Pentru indicarea starii de incarcare/salvare
    const [error, setError] = useState(null); // Pentru afisarea erorilor
    const [initialLoadDone, setInitialLoadDone] = useState(false); // Pentru a controla afisarea spinner-ului la incarcarea datelor

    // --- NOI STĂRI PENTRU QUIZ ---
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]); // Array de obiecte question: { questionText, options: [], correctAnswer, imageUrl }
    const [existingQuizId, setExistingQuizId] = useState(null); // ID-ul quiz-ului existent, daca e in modul editare
    const [quizSaving, setQuizSaving] = useState(false);
    const [quizError, setQuizError] = useState(null);

    // Efect pentru preluarea datelor lecției ȘI QUIZ-ULUI în modul de editare
    useEffect(() => {
        // Redirectioneaza daca utilizatorul nu este autentificat sau nu este administrator
        if (!isAuthenticated || user?.role !== 'admin') {
            alert('Nu ai permisiuni de administrator pentru a accesa această pagină. Te rog loghează-te ca admin.');
            navigate('/login');
            return;
        }

        // Daca suntem in modul de editare, preluam datele lectiei si ale quiz-ului
        if (isEditMode) { 
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Preluam atat lectia cat si quiz-ul in paralel
                    const [lessonResponse, quizResponse] = await Promise.all([
                        axios.get(`http://localhost:3000/api/lessons/${id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        axios.get(`http://localhost:3000/api/quizzes/lesson/${id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).catch(err => {
                            // Daca nu exista quiz sau eroare de acces, logam si continuam (quiz-ul ramane null)
                            console.warn("FRONTEND DEBUG: Nu s-a putut prelua quiz-ul pentru lecție (poate nu există sau acces neautorizat):", err.message);
                            return { data: { data: null } }; 
                        })
                    ]);

                    const lessonData = lessonResponse.data.data;
                    setLessonTitle(lessonData.title || '');
                    setLessonOrder(lessonData.order || '');
                    setEditorContent(lessonData.theoryContent || ''); 
                    setExistingSheetMusicImageUrl(lessonData.sheetMusicImageUrl || '');
                    setExistingAudioUrl(lessonData.audioUrl || '');

                    // Seteaza datele quiz-ului daca au fost preluate
                    if (quizResponse.data && quizResponse.data.data) {
                        const quizData = quizResponse.data.data;
                        setExistingQuizId(quizData.id); // Sau quizData._id, in functie de ce folosesti
                        setQuizTitle(quizData.title || '');
                        setQuizDescription(quizData.description || '');
                        setQuizQuestions(quizData.questions || []);
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

    // Handler pentru modificările în editorul TinyMCE
    const handleEditorChange = (content, editor) => {
        // console.log('Content changed:', content); // Poate fi folosit pentru debugging
    };

    // Handlere pentru modificarea fisierelor (imagine partitura si audio lectie)
    const handleSheetMusicImageChange = (e) => {
        setSheetMusicImage(e.target.files[0]);
    };

    const handleLessonAudioChange = (e) => {
        setLessonAudio(e.target.files[0]);
    };

    // Handlere pentru stergerea fisierelor existente (in modul editare)
    const handleRemoveSheetMusicImage = () => {
        setSheetMusicImage(null);
        setExistingSheetMusicImageUrl(''); 
    };

    const handleRemoveLessonAudio = () => {
        setLessonAudio(null);
        setExistingAudioUrl(''); 
    };

    // --- FUNCTII PENTRU GESTIONAREA QUIZ-ULUI ---

    // Adauga o noua intrebare in quiz
    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, { questionText: '', options: ['', '', ''], correctAnswer: '', imageUrl: null, imageFile: null }]);
    };

    // Sterge o intrebare din quiz
    const handleRemoveQuestion = (index) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    };

    // Actualizeaza textul unei intrebari
    const handleQuestionTextChange = (index, text) => {
        const newQuestions = [...quizQuestions];
        newQuestions[index].questionText = text;
        setQuizQuestions(newQuestions);
    };

    // Adauga o optiune noua pentru o intrebare specifica
    const handleAddOption = (questionIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options.push('');
        setQuizQuestions(newQuestions);
    };

    // Sterge o optiune pentru o intrebare specifica
    const handleRemoveOption = (questionIndex, optionIndex) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        // Daca optiunea stearsa era raspunsul corect, reseteaza correctAnswer
        if (newQuestions[questionIndex].correctAnswer === newQuestions[questionIndex].options[optionIndex]) {
            newQuestions[questionIndex].correctAnswer = '';
        }
        setQuizQuestions(newQuestions);
    };

    // Actualizeaza textul unei optiuni
    const handleOptionTextChange = (questionIndex, optionIndex, text) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].options[optionIndex] = text;
        setQuizQuestions(newQuestions);
    };

    // Seteaza raspunsul corect pentru o intrebare
    const handleCorrectAnswerChange = (questionIndex, optionText) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].correctAnswer = optionText;
        setQuizQuestions(newQuestions);
    };

    // Handler pentru incarcarea unei imagini pentru intrebare
    const handleQuestionImageChange = (questionIndex, file) => {
        const newQuestions = [...quizQuestions];
        newQuestions[questionIndex].imageFile = file; // Stocam fisierul temporar
        newQuestions[questionIndex].imageUrl = file ? URL.createObjectURL(file) : null; // Preview URL
        setQuizQuestions(newQuestions);
    };

    // Handler pentru stergerea unei imagini de la o intrebare
    const handleRemoveQuestionImage = (questionIndex) => {
        const newQuestions = [...quizQuestions];
        // Daca imaginea era un URL existent din DB, o setam la null/gol pentru a semnala stergerea
        if (newQuestions[questionIndex].imageUrl && newQuestions[questionIndex].imageUrl.startsWith('http')) {
            newQuestions[questionIndex].imageUrl = 'null'; // Semnalam backend-ului ca trebuie stearsa
        } else {
            // Daca era un preview local, pur si simplu il curatam
            newQuestions[questionIndex].imageUrl = null;
        }
        newQuestions[questionIndex].imageFile = null; // Eliminam fisierul temporar
        setQuizQuestions(newQuestions);
    };


    // --- FUNCTIA PRINCIPALA DE SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQuizError(null); // Resetam erorile de quiz la submit

        if (!token) {
            setError('Nu ești autentificat. Te rog loghează-te.');
            setLoading(false);
            navigate('/login');
            return;
        }

        const lessonFormData = new FormData();
        lessonFormData.append('title', lessonTitle);
        lessonFormData.append('order', lessonOrder);
        lessonFormData.append('theoryContent', editorRef.current ? editorRef.current.getContent() : ''); 

        if (sheetMusicImage) {
            lessonFormData.append('sheetMusicImage', sheetMusicImage);
        } else if (isEditMode && existingSheetMusicImageUrl === '') {
            lessonFormData.append('sheetMusicImageUrl', 'null'); 
        }

        if (lessonAudio) {
            lessonFormData.append('audioFile', lessonAudio);
        } else if (isEditMode && existingAudioUrl === '') {
            lessonFormData.append('audioUrl', 'null'); 
        }

        console.log(`Se pregătesc datele pentru ${isEditMode ? 'actualizare' : 'creare'} lecție (admin LessonForm).`);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            };

            let lessonResponse;
            let newLessonId = id; // Pastram ID-ul existent in modul editare

            if (isEditMode) {
                lessonResponse = await axios.put(`http://localhost:3000/api/lessons/${id}`, lessonFormData, config);
                console.log('Lecția a fost actualizată cu succes:', lessonResponse.data);
            } else {
                lessonResponse = await axios.post('http://localhost:3000/api/lessons/create', lessonFormData, config);
                console.log('Lecția a fost creată cu succes:', lessonResponse.data);
                newLessonId = lessonResponse.data.data.id; // Preluam ID-ul noii lectii
            }

            // --- Salvare/Actualizare Quiz ---
            setQuizSaving(true);
            // Cream payload-ul pentru quiz. Asiguram ca `correctAnswer` este textul optiunii.
            const quizPayload = {
                lessonId: newLessonId, // Asiguram ca quiz-ul este legat de lectia corecta
                title: quizTitle,
                description: quizDescription,
                questions: quizQuestions.map(q => {
                    // Preparam fiecare intrebare pentru trimitere.
                    // Important: imageUrl va contine "null" ca string daca imaginea a fost stearsa
                    // sau url-ul temporar blob pentru fisierele noi care vor fi procesate de backend.
                    return {
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer, // Deja este textul, conform structurii
                        // imageUrl: q.imageUrl // Daca imageUrl e direct URL-ul, backend-ul ar trebui sa-l ignore sau sa-l proceseze
                    };
                }),
            };

            // Cream FormData pentru quiz pentru a include imagini pentru intrebari
            const quizFormData = new FormData();
            quizFormData.append('quizData', JSON.stringify({ // Trimitem datele quiz-ului ca JSON string
                lessonId: newLessonId,
                title: quizTitle,
                description: quizDescription,
                questions: quizQuestions.map(q => ({
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    // imageUrl field will be handled by backend if imageFile is present
                    imageUrl: (q.imageUrl && q.imageUrl !== 'null' && !q.imageFile) ? q.imageUrl : null // Only include existing URL if no new file and not marked for deletion
                }))
            }));
            
            // Adaugam fisierele de imagine pentru fiecare intrebare
            quizQuestions.forEach((q, qIndex) => {
                if (q.imageFile) {
                    quizFormData.append(`questionImage_${qIndex}`, q.imageFile);
                }
                // Daca o imagine a fost stearsa (imageUrl este 'null' string), semnalam asta explicit
                if (q.imageUrl === 'null' && !q.imageFile) {
                    quizFormData.append(`deleteImage_${qIndex}`, 'true');
                }
            });


            let quizResponse;
            if (existingQuizId) {
                // Actualizam quiz-ul existent
                quizResponse = await axios.put(`http://localhost:3000/api/quizzes/${existingQuizId}`, quizFormData, config);
                console.log('Quiz-ul a fost actualizat cu succes:', quizResponse.data);
            } else if (quizQuestions.length > 0 && quizTitle) {
                // Cream un nou quiz (doar daca exista intrebari si titlu)
                quizResponse = await axios.post(`http://localhost:3000/api/quizzes`, quizFormData, config);
                console.log('Quiz-ul a fost creat cu succes:', quizResponse.data);
            }
            
            setQuizSaving(false);
            navigate('/admin/lessons'); // Redirectioneaza dupa salvarea ambelor
        } catch (error) {
            console.error('Eroare la salvarea lecției sau a quiz-ului:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                setError(error.response.data.message || 'Eroare la salvarea lecției.');
                setQuizError(error.response.data.message || 'Eroare la salvarea quiz-ului.');

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

    // Afiseaza un mesaj de incarcare in modul editare pana la preluarea datelor
    if (isEditMode && !initialLoadDone) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă datele lecției și ale quiz-ului pentru editare...</p>
            </div>
        );
    }

    // Structura JSX a formularului
    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-xl shadow-lg my-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {isEditMode ? 'Editează Lecție' : 'Adaugă Lecție Nouă'} (Admin)
            </h1>

            {/* Afisarea erorilor generale */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Eroare:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Secțiunea pentru detalii lecție */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalii Lecție</h2>
                    {/* Campul pentru Titlul Lecției */}
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

                    {/* Campul pentru Ordinea Lecției */}
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

                    {/* Campul pentru Imaginea Partiturii */}
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

                    {/* Campul pentru Fișier Audio Lecție */}
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

                    {/* Editorul TinyMCE pentru continutul lectiei */}
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Conținut Complet al Lecției
                        </label>
                        <Editor
                            apiKey="atlitew2hlznfbyyagqstfbqnds6ued0xcoqtkcp4r57yypq"
                            onInit={(evt, editor) => {
                                editorRef.current = editor;
                                // Seteaza directia textului si alinierea la incarcare
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

                {/* SECȚIUNEA PENTRU GESTIONAREA QUIZ-ULUI */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionare Quiz (Opțional)</h2>
                    {quizError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Eroare Quiz:</strong>
                        <span className="block sm:inline"> {quizError}</span>
                    </div>}

                    <div className="mb-4">
                        <label htmlFor="quizTitle" className="block text-lg font-medium text-gray-700 mb-2">
                            Titlul Quiz-ului
                        </label>
                        <input
                            type="text"
                            id="quizTitle"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            placeholder="Ex: Quiz de verificare a înțelegerii"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="quizDescription" className="block text-lg font-medium text-gray-700 mb-2">
                            Descriere Quiz
                        </label>
                        <textarea
                            id="quizDescription"
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                            placeholder="O scurtă descriere a quiz-ului..."
                        ></textarea>
                    </div>

                    {/* Lista de întrebări */}
                    {quizQuestions.length === 0 && (
                        <p className="text-gray-600 mb-4">Nu există încă întrebări. Adaugă una!</p>
                    )}

                    {quizQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="p-5 border border-gray-200 rounded-lg bg-gray-50 mb-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Întrebarea {qIndex + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(qIndex)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                >
                                    Șterge Întrebarea
                                </button>
                            </div>

                            <div className="mb-4">
                                <label htmlFor={`questionText-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                                    Textul Întrebării
                                </label>
                                <input
                                    type="text"
                                    id={`questionText-${qIndex}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                                    value={question.questionText}
                                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                    required
                                />
                            </div>

                            {/* Imagine pentru intrebare (optional) */}
                            <div className="mb-4">
                                <label htmlFor={`questionImage-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagine (Opțional)
                                </label>
                                {/* Afiseaza imaginea existenta/noua si buton de stergere */}
                                {question.imageUrl && question.imageUrl !== 'null' ? (
                                    <div className="flex flex-col items-center justify-center space-y-2 mb-3 p-2 border border-gray-200 rounded-lg bg-gray-100">
                                        <img src={question.imageUrl.startsWith('blob:') ? question.imageUrl : `http://localhost:3000${question.imageUrl}`} 
                                             alt="Imagine întrebare" 
                                             className="max-w-full h-auto object-contain rounded-lg max-h-48" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestionImage(qIndex)}
                                            className="bg-red-400 text-white px-2 py-1 rounded-md text-xs hover:bg-red-500 transition-colors"
                                        >
                                            Șterge Imaginea Întrebării
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-2">Nu există imagine pentru această întrebare.</p>
                                )}
                                <input
                                    type="file"
                                    id={`questionImage-${qIndex}`}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    onChange={(e) => handleQuestionImageChange(qIndex, e.target.files[0])}
                                />
                                {question.imageFile && (
                                    <p className="mt-1 text-sm text-gray-600">Fișier nou selectat: {question.imageFile.name}</p>
                                )}
                            </div>

                            <h4 className="text-lg font-medium text-gray-700 mb-3">Opțiuni de Răspuns:</h4>
                            <div className="space-y-3">
                                {question.options.map((optionText, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`correctAnswer-${qIndex}`}
                                            value={optionText}
                                            checked={question.correctAnswer === optionText}
                                            onChange={() => handleCorrectAnswerChange(qIndex, optionText)}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                                            required // Cel putin o optiune trebuie sa fie corecta
                                        />
                                        <input
                                            type="text"
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={optionText}
                                            onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                                            placeholder={`Opțiunea ${oIndex + 1}`}
                                            required
                                        />
                                        {question.options.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                className="bg-red-400 hover:bg-red-500 text-white px-2 py-1 rounded-md text-xs transition-colors"
                                            >
                                                Elimină
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAddOption(qIndex)}
                                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Adaugă Opțiune
                            </button>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200 shadow-md flex items-center justify-center space-x-2"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                        <span>Adaugă Întrebare Nouă</span>
                    </button>
                </div> {/* Sfarsit sectiune Gestionare Quiz */}

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
