// src/pages/LessonForm.jsx
import React, { useState, useRef, useEffect, useContext } from 'react'; // <-- NOU: Adaugă useEffect, useContext
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // <-- NOU: Importă AuthContext-ul tău

const LessonForm = ({ lessonToEdit }) => { // Am adaugat prop-ul lessonToEdit pentru consistentă cu discuțiile anterioare
    const editorRef = useRef(null);
    const navigate = useNavigate();

    // NOU: Preia token-ul și informațiile despre utilizator (inclusiv rolul) din AuthContext
    const { token, isAuthenticated, user, logout } = useContext(AuthContext); 

    const [lessonTitle, setLessonTitle] = useState(lessonToEdit ? lessonToEdit.title : ''); // Poate fi populat dacă editezi
    const [lessonOrder, setLessonOrder] = useState(lessonToEdit ? lessonToEdit.order : ''); // Poate fi populat dacă editezi
    const [lessonDescription, setLessonDescription] = useState(''); // Rămâne așa, nu este folosit în FormData
    const [editorContent, setEditorContent] = useState(lessonToEdit ? lessonToEdit.theoryContent : ''); // Poate fi populat dacă editezi

    const [sheetMusicImage, setSheetMusicImage] = useState(null);
    const [lessonAudio, setLessonAudio] = useState(null);
    const [loading, setLoading] = useState(false); // Pentru a arăta starea de încărcare
    const [error, setError] = useState(null);     // Pentru a afișa erori

    // NOU: Redirecționează dacă utilizatorul nu este autentificat sau nu este admin
    useEffect(() => {
        // Dacă nu ești deloc autentificat SAU dacă ești autentificat, dar nu ești admin
        if (!isAuthenticated || user?.role !== 'admin') {
            alert('Nu ai permisiuni de administrator pentru a accesa această pagină. Te rog loghează-te ca admin.');
            navigate('/login'); // Redirecționează la pagina de login
        }
    }, [isAuthenticated, user, navigate]); // Rulează când aceste valori se schimbă

    const handleEditorChange = (content, editor) => {
        setEditorContent(content);
    };

    const handleSheetMusicImageChange = (e) => {
        setSheetMusicImage(e.target.files[0]);
    };

    const handleLessonAudioChange = (e) => {
        setLessonAudio(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Începe încărcarea
        setError(null);    // Resetează erorile

        // NOU: Verifică dacă există un token înainte de a trimite cererea
        if (!token) {
            setError('Nu ești autentificat. Te rog loghează-te.');
            setLoading(false);
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('title', lessonTitle);
        formData.append('order', lessonOrder);
        formData.append('theoryContent', editorContent);

        if (sheetMusicImage) {
            formData.append('sheetMusicImage', sheetMusicImage);
        }
        if (lessonAudio) {
            formData.append('audioFile', lessonAudio);
        }

        console.log("Se pregătesc datele pentru trimitere (admin LessonForm).");

        try {
            // NOU: AICI ESTE LOCUL UNDE ADĂUGI TOKEN-UL ÎN HEADER-UL AUTHORIZATION
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // <-- LINIA CHEIE! Trimite token-ul JWT aici!
                },
                // withCredentials: true // De obicei nu e necesar pentru JWT, doar pentru cookie-uri
            };

            // URL-ul este acum corect: http://localhost:3000/api/lessons/create
            const response = await axios.post('http://localhost:3000/api/lessons/create', formData, config);

            console.log('Lecția a fost creată cu succes:', response.data);
            alert('Lecția a fost salvată cu succes!');
            navigate('/lessons'); // Navighează către lista de lecții (sau unde e potrivit)

        } catch (error) {
            console.error('Eroare la salvarea lecției:', error);
            if (error.response) {
                console.error('Data eroare:', error.response.data);
                console.error('Status eroare:', error.response.status);
                setError(error.response.data.message || 'Eroare la salvarea lecției.');

                // NOU: Dacă primești 401 sau 403, probabil token-ul a expirat sau nu ai permisiuni
                if (error.response.status === 401 || error.response.status === 403) {
                    alert('Sesiunea a expirat sau nu ai permisiuni. Te rog loghează-te din nou.');
                    logout(); // Deconectează utilizatorul din frontend
                    navigate('/login'); // Redirecționează la login
                }
            } else if (error.request) {
                console.error('Niciun răspuns de la server:', error.request);
                setError('Nu s-a putut conecta la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                console.error('Eroare la configurarea cererii:', error.message);
                setError(`A apărut o eroare: ${error.message}`);
            }
        } finally {
            setLoading(false); // Oprește încărcarea
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Adaugă/Editează Lecție (Admin)</h1>

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

                <div className="mb-6" style={{ display: 'none' }}> {/* Câmpul description e ascuns */}
                    <label htmlFor="lessonDescription" className="block text-lg font-medium text-gray-700 mb-2">
                        Descriere Scurtă (nu se trimite la backend în configurația actuală)
                    </label>
                    <textarea
                        id="lessonDescription"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={lessonDescription}
                        onChange={(e) => setLessonDescription(e.target.value)}
                    ></textarea>
                </div>


                <div className="mb-6">
                    <label htmlFor="sheetMusicImage" className="block text-lg font-medium text-gray-700 mb-2">
                        Imaginea Partiturii (opțional)
                    </label>
                    <input
                        type="file"
                        id="sheetMusicImage"
                        accept="image/*"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
                        onChange={handleSheetMusicImageChange}
                    />
                    {sheetMusicImage && (
                        <p className="mt-2 text-sm text-gray-600">Fișier imagine selectat: {sheetMusicImage.name}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="lessonAudio" className="block text-lg font-medium text-gray-700 mb-2">
                        Fișier Audio Lecție (opțional)
                    </label>
                    <input
                        type="file"
                        id="lessonAudio"
                        accept="audio/*"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
                        onChange={handleLessonAudioChange}
                    />
                    {lessonAudio && (
                        <p className="mt-2 text-sm text-gray-600">Fișier audio lecție selectat: {lessonAudio.name}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                        Conținut Complet al Lecției
                    </label>
                    <Editor
                        apiKey="atlitew2hlznfbyyagqstfbqnds6ued0xcoqtkcp4r57yypq"
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue={editorContent || "<p>Începe să scrii conținutul lecției aici...</p>"}
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
                        }}
                        onEditorChange={handleEditorChange}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors duration-300"
                    disabled={loading} // Dezactivează butonul în timpul încărcării
                >
                    {loading ? 'Se salvează...' : 'Salvează Lecția'}
                </button>
            </form>
        </div>
    );
};

export default LessonForm;