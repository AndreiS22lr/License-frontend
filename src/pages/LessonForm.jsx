// src/pages/LessonForm.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
// CORECTIE: Sintaxa corectă pentru importul useParams
import { useNavigate, useParams } from 'react-router-dom'; 
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LessonForm = () => {
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams(); 
    
    const isEditMode = id && id !== 'new' && id !== 'create'; 
    
    const { token, isAuthenticated, user, logout } = useContext(AuthContext);

    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonOrder, setLessonOrder] = useState('');
    // Pastram editorContent pentru a seta valoarea initiala la incarcare
    const [editorContent, setEditorContent] = useState(''); 

    const [sheetMusicImage, setSheetMusicImage] = useState(null);
    const [lessonAudio, setLessonAudio] = useState(null);
    
    const [existingSheetMusicImageUrl, setExistingSheetMusicImageUrl] = useState('');
    const [existingAudioUrl, setExistingAudioUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false); 

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            alert('Nu ai permisiuni de administrator pentru a accesa această pagină. Te rog loghează-te ca admin.');
            navigate('/login');
            return;
        }

        if (isEditMode) { 
            const fetchLessonData = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://localhost:3000/api/lessons/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}` 
                        }
                    });
                    const lessonData = response.data.data;
                    setLessonTitle(lessonData.title || '');
                    setLessonOrder(lessonData.order || '');
                    setEditorContent(lessonData.theoryContent || ''); // Setează conținutul inițial
                    setExistingSheetMusicImageUrl(lessonData.sheetMusicImageUrl || '');
                    setExistingAudioUrl(lessonData.audioUrl || '');
                } catch (err) {
                    console.error('Eroare la preluarea datelor lecției pentru editare:', err);
                    setError(err.response?.data?.message || 'Nu s-au putut încărca datele lecției pentru editare.');
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
            fetchLessonData();
        } else {
            setInitialLoadDone(true);
        }
    }, [id, isEditMode, isAuthenticated, user, navigate, token, logout]); 

    // handleEditorChange nu mai actualizează direct `editorContent` la fiecare tastă,
    // deoarece editorul va fi "uncontrolled".
    // Poti folosi acest handler pentru log-uri sau alte actiuni declansate de modificari.
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!token) {
            setError('Nu ești autentificat. Te rog loghează-te.');
            setLoading(false);
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('title', lessonTitle);
        formData.append('order', lessonOrder);
        // CORECTIE CHEIE: Preluăm conținutul direct de la editor la submit
        formData.append('theoryContent', editorRef.current ? editorRef.current.getContent() : ''); 

        if (sheetMusicImage) {
            formData.append('sheetMusicImage', sheetMusicImage);
        } else if (isEditMode && existingSheetMusicImageUrl === '') {
            formData.append('sheetMusicImageUrl', 'null'); 
        }

        if (lessonAudio) {
            formData.append('audioFile', lessonAudio);
        } else if (isEditMode && existingAudioUrl === '') {
            formData.append('audioUrl', 'null'); 
        }

        console.log(`Se pregătesc datele pentru ${isEditMode ? 'actualizare' : 'creare'} lecție (admin LessonForm).`);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            };

            let response;
            if (isEditMode) {
                response = await axios.put(`http://localhost:3000/api/lessons/${id}`, formData, config);
                console.log('Lecția a fost actualizată cu succes:', response.data);
                alert('Lecția a fost actualizată cu succes!');
            } else {
                response = await axios.post('http://localhost:3000/api/lessons/create', formData, config);
                console.log('Lecția a fost creată cu succes:', response.data);
                alert('Lecția a fost creată cu succes!');
            }
            navigate('/admin/lessons');
        } catch (error) {
            console.error('Eroare la salvarea lecției:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                setError(error.response.data.message || 'Eroare la salvarea lecției.');

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
        } finally {
            setLoading(false);
        }
    };

    if (isEditMode && !initialLoadDone) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Se încarcă datele lecției pentru editare...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
                {isEditMode ? 'Editează Lecție' : 'Adaugă Lecție Nouă'} (Admin)
            </h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Eroare:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>}

            <form onSubmit={handleSubmit}>
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
                                className="max-w-full h-auto object-contain rounded-lg shadow-md border border-gray-300 max-h-[75vh]" // <-- MODIFICAT AICI
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
                            // Setarea directă a direcției textului în corpul editorului, la încărcare
                            // Nu mai este nevoie să așteptăm 'loadContent'
                            editor.dom.setStyle(editor.dom.select('body')[0], 'direction', 'ltr');
                            editor.dom.setStyle(editor.dom.select('body')[0], 'text-align', 'left');
                        }}
                        // NOU: Folosim initialValue pentru a seta continutul O SINGURĂ DATĂ.
                        // Eliminam prop-ul `value` pentru a face TinyMCE un "uncontrolled component".
                        initialValue={editorContent || "<p>Începe să scrii conținutul lecției aici...</p>"} // Placeholder aici
                        // value={editorContent} // <-- LINIA COMENTATĂ / ȘTEARSĂ
                        onEditorChange={handleEditorChange} // Acum poate fi folosit pentru log-uri, dar nu mai controlează valoarea
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
                            placeholder: 'Începe să scrii conținutul lecției aici...' // Placeholder TinyMCE
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                    disabled={loading}
                >
                    {loading ? 'Se salvează...' : (isEditMode ? 'Actualizează Lecția' : 'Salvează Lecția')}
                </button>
            </form>
        </div>
    );
};

export default LessonForm;
