import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importăm useParams pentru a extrage ID-ul din URL și useNavigate pentru a naviga înapoi

// Am adăugat o proprietate 'fullContent' cu HTML simulat pentru demonstrație
// Aceasta va fi înlocuită ulterior cu conținutul HTML real de la backend
const DUMMY_LESSONS = [
  { 
    id: "1", 
    title: "Introducere în Muzica Bizantină", 
    description: "O privire generală asupra istoriei și principiilor.", 
    isCompleted: true,
    fullContent: `
      <p>Muzica bizantină este o formă de muzică religioasă, vocală și monodică, practicată în Biserica Ortodoxă Răsăriteană. Are rădăcini adânci în tradiția muzicală a Imperiului Bizantin și este strâns legată de cultul liturgic.</p>
      <h2>Caracteristici Principale</h2>
      <ul>
        <li><strong>Monodie:</strong> Se cântă pe o singură linie melodică, fără acompaniament instrumental.</li>
        <li><strong>Vocală:</strong> Este interpretată exclusiv cu vocea umană.</li>
        <li><strong>Liturgică:</strong> Este destinată în mod specific serviciilor divine ortodoxe.</li>
        <li><strong>Sistemul de glasuri:</strong> Utilizează un sistem de opt moduri (glasuri) cu caracteristici melodice și emoționale specifice.</li>
      </ul>
      <p>Această muzică a evoluat de-a lungul secolelor, păstrându-și esența spirituală și frumusețea austeră. Înțelegerea contextului istoric și religios este crucială pentru a aprecia pe deplin profunzimea muzicii bizantine.</p>
      <p><strong>Exemplu:</strong> Ascultă o scurtă <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">melodie bizantină</a> pentru a simți atmosfera.</p>
      <h3>Importanța sa</h3>
      <p>Muzica bizantină nu este doar o artă, ci o formă de rugăciune sonoră, menită să înalțe sufletul către Dumnezeu.</p>
    `
  },
  { id: "2", title: "Note și Semne Muzicale", description: "Află elementele de bază ale notației psaltice.", isCompleted: false, fullContent: "<p>Conținut detaliat despre note și semne muzicale...</p>" },
  { id: "3", title: "Modurile Bisericești (glasuri)", description: "Explorează diferitele glasuri și caracteristicile lor.", isCompleted: true, fullContent: "<p>Conținut detaliat despre modurile bisericești...</p>" },
  // ... poți adăuga 'fullContent' și pentru celelalte lecții simulate
];

const LessonDetail = () => {
  const { id } = useParams(); // Extrage ID-ul lecției din URL
  const navigate = useNavigate(); // Hook pentru navigare

  // Caută lecția în datele simulate
  const lesson = DUMMY_LESSONS.find(l => l.id === id);

  // Dacă lecția nu este găsită, afișează un mesaj sau redirecționează
  if (!lesson) {
    return (
      <div className="container mx-auto p-8 text-center text-red-700">
        <h1 className="text-3xl font-bold mb-4">Lecția nu a fost găsită.</h1>
        <button 
          onClick={() => navigate('/lessons')} 
          className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
        >
          Înapoi la lecții
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={() => navigate('/lessons')} 
        className="mb-8 inline-flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Înapoi la lista de lecții
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{lesson.title}</h1>
        <p className="text-gray-600 text-lg mb-8 italic">{lesson.description}</p>

        {/* Aici se randează conținutul HTML complet */}
        {/* ATENȚIE: dangerouslySetInnerHTML trebuie folosit cu precauție.
                   Asigură-te că HTML-ul provine dintr-o sursă de încredere (backend-ul tău, unde controlezi conținutul). */}
        <div 
          className="prose prose-lg max-w-none text-gray-800" // Folosim 'prose' pentru stilizare automată a HTML-ului
          dangerouslySetInnerHTML={{ __html: lesson.fullContent }} 
        />
      </div>

      {/* Secțiune pentru navigare la lecția următoare/anterioară sau marcare ca finalizată */}
      <div className="flex justify-between items-center mt-10 p-6 bg-gray-50 rounded-xl shadow-md">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          Lecția anterioară
        </button>
        <button className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors duration-300">
          Marchează ca finalizată
        </button>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          Lecția următoare
        </button>
      </div>
    </div>
  );
};

export default LessonDetail;