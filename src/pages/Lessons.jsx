import React from "react";
import { Link } from "react-router-dom"; 

const DUMMY_LESSONS = [
  { id: "1", title: "Introducere în Muzica Bizantină", description: "O privire generală asupra istoriei și principiilor.", isCompleted: true },
  { id: "2", title: "Note și Semne Muzicale", description: "Află elementele de bază ale notației psaltice.", isCompleted: false },
  { id: "3", title: "Modurile Bisericești (glasuri)", description: "Explorează diferitele glasuri și caracteristicile lor.", isCompleted: true },
  { id: "4", title: "Exerciții de Respirație și Voce", description: "Tehnici pentru o emisie vocală corectă.", isCompleted: false },
  { id: "5", title: "Ritmică și Metru", description: "Înțelegerea ritmurilor și măsurilor în muzica bizantină.", isCompleted: false },
  { id: "6", title: "Ornamentația Psaltică", description: "Învățarea și aplicarea ornamentelor specifice.", isCompleted: false },
  { id: "7", title: "Stihirariul și Irmologhionul", description: "Explorarea principalelor cărți de cântări.", isCompleted: false },
  { id: "8", title: "Învățarea Idiomelarului", description: "Introducere în cântările specifice.", isCompleted: false },
];

const Lessons = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">Lecții de Muzică Bizantină</h1>

      <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        Aici vei găsi o colecție vastă de lecții, de la noțiuni fundamentale până la tehnici avansate, pentru a-ți aprofunda cunoștințele în muzica psaltică.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {DUMMY_LESSONS.map((lesson, index) => (
          <Link to={`/lessons/${lesson.id}`} key={lesson.id} className="block group">
            <div className="bg-red-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"> 

              <div className="p-4 flex flex-col h-full"> {/* Adăugăm flex flex-col h-full pentru layout consistent */}
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-red-100 transition-colors duration-300 flex items-center">
                  <span className="bg-white text-red-700 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mr-2"> 
                    {index + 1}
                  </span>
                  {lesson.title}
                </h2>
                <p className="text-white leading-relaxed text-sm flex-grow"> {/* flex-grow pentru descriere */}
                  {lesson.description}
                </p>

                {/* Statusul lecției, acum în fluxul normal al documentului */}
                {lesson.isCompleted ? (
                  <span className="inline-block mt-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full self-end"> {/* self-end pentru aliniere la dreapta */}
                    Completed
                  </span>
                ) : (
                  <span className="inline-block mt-4 bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full self-end"> {/* self-end pentru aliniere la dreapta */}
                    Începe acum
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-16 p-8 bg-gray-500 text-white rounded-xl shadow-md">
        <h3 className="text-3xl font-bold mb-4">Pregătește-te pentru următoarele lecții!</h3>
        <p className="text-lg mb-6">
          Conținutul este actualizat periodic. Rămâi conectat pentru noi cursuri și materiale.
        </p>
      </div>
    </div>
  );
};

export default Lessons;