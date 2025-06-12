// src/pages/LessonDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LessonDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stare pentru înregistrarea audio a utilizatorului
  const [userRecording, setUserRecording] = useState(null); // <-- ACEASTA ESTE ZONA AUDIO PENTRU UTILIZATOR

  // Funcție pentru gestionarea selecției fișierului audio de către utilizator
  const handleUserRecordingChange = (e) => {
    setUserRecording(e.target.files[0]); 
  };

  // Funcție pentru a simula trimiterea înregistrării utilizatorului
  const handleUserRecordingSubmit = async (e) => {
    e.preventDefault();

    if (!userRecording) {
      alert("Te rog selectează un fișier audio pentru înregistrare.");
      return;
    }

    const formData = new FormData();
    formData.append('lessonId', id); 
    formData.append('userRecording', userRecording); // Fișierul audio al utilizatorului

    console.log("Se pregătește înregistrarea utilizatorului pentru trimitere:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    console.log("Aceste date ar fi trimise către backend. Verifică tab-ul Network în browser DevTools.");
    
    alert('Înregistrarea ta a fost pregătită pentru trimitere (vezi consola)');
    setUserRecording(null); 
  };

  useEffect(() => {
    const fetchLesson = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const dummyLessons = [
        { 
          id: '1', 
          title: 'Introducere în Chitara', 
          description: 'Află bazele chitarei acustice.', 
          imageUrl: 'https://images.unsplash.com/photo-1546187796-0373e921d782?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
          fullContent: `<p>Acest curs îți va oferi o introducere solidă în lumea chitarei. Vom acoperi elemente esențiale precum: anatomia chitarei, primele acorduri, cum să ții pana și tehnici de bază pentru acompaniament.</p>
                        <p><strong>Exercițiu practic:</strong> Începe prin a exersa acordurile de G, C și D. Concentrează-te pe o tranziție lină între ele.</p>
                        <p>Teoria este importantă, dar practicarea regulată este cheia progresului.</p>
                        <h3>Primele Acorduri Esențiale</h3>
                        <ul>
                          <li><strong>G Major:</strong> Degetul 1 pe coarda A (fret 2), Degetul 2 pe coarda joasă E (fret 3), Degetul 3 pe coarda înaltă E (fret 3).</li>
                          <li><strong>C Major:</strong> Degetul 1 pe coarda B (fret 1), Degetul 2 pe coarda D (fret 2), Degetul 3 pe coarda A (fret 3).</li>
                          <li><strong>D Major:</strong> Degetul 1 pe coarda G (fret 2), Degetul 2 pe coarda înaltă E (fret 2), Degetul 3 pe coarda B (fret 3).</li>
                        </ul>
                        <p>Nu te descuraja dacă sună ciudat la început. Perseverența este crucială!</p>`,
        },
        { 
          id: '2', 
          title: 'Tehnici Avansate de Picking', 
          description: 'Aprofundează tehnicile de picking alternativ și sweep.', 
          imageUrl: 'https://images.unsplash.com/photo-1510915366874-958cfb5ddf77?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
          fullContent: `<p>Acest modul se concentrează pe rafinarea tehnicilor de picking, esențiale pentru solo-uri rapide și arpegii complexe.</p>
                        <p>Vom analiza picking-ul alternativ, sweep picking-ul și hibrid picking-ul. Fiecare tehnică necesită precizie și sincronizare.</p>
                        <h3>Exerciții de Picking</h3>
                        <p>Începe cu metronomul la o viteză redusă și crește treptat pe măsură ce precizia se îmbunătățește.</p>
                        <ul>
                          <li><strong>Picking Alternativ:</strong> Exersează o scală simplă (de exemplu, C Major) cu mișcări strict alternative (jos-sus-jos-sus).</li>
                          <li><strong>Sweep Picking:</strong> Abordează arpegii (ex: C Major Arpeggio - C-E-G) cu mișcări continue ale penei.</li>
                        </ul>
                        <p>Sincronizarea ambelor mâini este vitală. Înregistrează-te și ascultă-te pentru a identifica zonele de îmbunătățire.</p>`,
        },
      ];

      const foundLesson = dummyLessons.find(l => l.id === id);
      if (foundLesson) {
        setLesson(foundLesson);
      } else {
        setError("Lecția nu a fost găsită.");
      }
      setLoading(false);
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
    return null; 
  }

  return (
    <div className="container mx-auto p-6">
      {/* Secțiunea de detalii a lecției (conținut admin) */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{lesson.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
        
        {lesson.imageUrl && (
          <img 
            src={lesson.imageUrl} 
            alt={lesson.title} 
            className="w-full h-80 object-cover rounded-lg mb-6 shadow-md" 
          />
        )}

        {lesson.audioUrl && (
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Înregistrarea Lecției (Admin)</h2>
                <audio controls src={lesson.audioUrl} className="w-full rounded-lg"></audio>
            </div>
        )}

        {/* Conținutul complet al lecției (din TinyMCE, creat de admin) */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: lesson.fullContent }}>
        </div>
      </div>

      {/* SECȚIUNEA PENTRU ÎNREGISTRAREA AUDIO A UTILIZATORULUI */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Încarcă-ți Înregistrarea</h2>
        <p className="text-gray-700 mb-4">
          Exersează ce ai învățat și încarcă-ți propria înregistrare audio pentru feedback sau pentru a-ți monitoriza progresul.
        </p>
        
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
          >
            Trimite Înregistrarea Mea
          </button>
        </form>
      </div>
    </div>
  );
};

export default LessonDetail;