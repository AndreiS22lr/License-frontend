// src/pages/LessonForm.jsx
import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';

const LessonForm = () => {
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [editorContent, setEditorContent] = useState('');
  
  // Stări pentru fișierele lecției (imagine și audio - încărcate de admin)
  const [lessonImage, setLessonImage] = useState(null); 
  const [lessonAudio, setLessonAudio] = useState(null); // <-- ACEASTA ESTE ZONA AUDIO PENTRU ADMIN

  const handleEditorChange = (content, editor) => {
    setEditorContent(content);
  };

  const handleImageChange = (e) => {
    setLessonImage(e.target.files[0]); 
  };

  const handleAudioChange = (e) => {
    setLessonAudio(e.target.files[0]); // Preluăm fișierul audio al lecției (admin)
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', lessonTitle);
    formData.append('description', lessonDescription);
    formData.append('fullContent', editorContent);
    
    if (lessonImage) {
      formData.append('image', lessonImage); 
    }
    if (lessonAudio) {
      formData.append('audio', lessonAudio); // Adăugăm fișierul audio al lecției la FormData
    }

    console.log("Se pregătesc datele pentru trimitere (admin LessonForm). Vezi log-ul FormData în browser Network tab.");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    
    alert('Lecția salvată (ca admin, vezi consola pentru date)');
    navigate('/lessons'); 
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Adaugă/Editează Lecție (Admin)</h1>
      
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
          <label htmlFor="lessonDescription" className="block text-lg font-medium text-gray-700 mb-2">
            Descriere Scurtă
          </label>
          <textarea
            id="lessonDescription"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
            value={lessonDescription}
            onChange={(e) => setLessonDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Câmp pentru imaginea lecției (admin) */}
        <div className="mb-6">
          <label htmlFor="lessonImage" className="block text-lg font-medium text-gray-700 mb-2">
            Imaginea Lecției (opțional, admin)
          </label>
          <input
            type="file"
            id="lessonImage"
            accept="image/*" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
            onChange={handleImageChange}
          />
          {lessonImage && (
            <p className="mt-2 text-sm text-gray-600">Fișier imagine selectat: {lessonImage.name}</p>
          )}
        </div>

        {/* Câmp pentru înregistrarea audio a lecției (admin) */}
        <div className="mb-6">
          <label htmlFor="lessonAudio" className="block text-lg font-medium text-gray-700 mb-2">
            Înregistrare Audio Lecție (opțional, admin)
          </label>
          <input
            type="file"
            id="lessonAudio"
            accept="audio/*" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-red-700 hover:file:bg-gray-200"
            onChange={handleAudioChange}
          />
          {lessonAudio && (
            <p className="mt-2 text-sm text-gray-600">Fișier audio lecție selectat: {lessonAudio.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Conținut Complet al Lecției (Admin)
          </label>
          <Editor
            apiKey="atlitew2hlznfbyyagqstfbqnds6ued0xcoqtkcp4r57yypq" 
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue="<p>Începe să scrii conținutul lecției aici...</p>"
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
        >
          Salvează Lecția
        </button>
      </form>
    </div>
  );
};

export default LessonForm;