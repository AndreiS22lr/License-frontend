import React from "react"; // Nu mai este nevoie de useState, așa că îl eliminăm
import { Link } from "react-router-dom";

const CATEGORIES = [
  { title: "Lectii", color: "bg-red-700", emoji: "📚", path: "/lessons" },
];

const Home = () => {
  // Am eliminat state-ul categorySearch și funcția handleCategoryChange
  // deoarece nu mai sunt necesare fără input-ul de căutare.

  return (
    <div>
      {/* Hero Section: Secțiunea cu imaginea de fundal */}
      <div
        className="relative h-64 md:h-80 lg:h-96 w-full bg-cover bg-center flex items-center justify-center text-white p-6"
        style={{ backgroundImage: "url('/poze/home.jpg')" }}
      >
        {/* Acest div creează un strat semitransparent negru peste imagine, pentru a face textul mai lizibil. */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        {/* Acesta este conținutul text (titlul) care apare peste imagine */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Bine ai venit, descoperă și învață muzica bizantină
          </h1>
          <p className="text-lg md:text-xl font-medium">
            Explorează lecții interactive ce cuprind bazele psalticii.
          </p>
        </div>
      </div>

      {/* Main Content: Restul conținutului paginii (căutare, categorii) */}
      <div className="p-6 max-w-5xl mx-auto">
        {/* Am eliminat complet secțiunea de Search Input de aici */}

        {/* descriere */}
        <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-lg text-gray-800 font-semibold mb-2">
            „Muzica bizantină este foarte folositoare de suflet. Nu trebuie să
            existe niciun creștin care să nu cunoască muzica bizantină. Toți
            trebuie s-o învățăm. Ea are o legătură directă cu sufletul. Muzica
            îl sfințește pe om fără jertfă. Fără osteneală, veselindu-te,
            devii sfânt (Cuviosul Porfirie Kafsokalivitul)”
          </p>
          <p className="text-sm text-gray-600">
            Aici vei găsi resurse variate pentru a aprofunda arta și practica
            muzicii psaltice. De la lecții introductive până la cântări
            complexe, totul este la îndemâna ta.
          </p>
        </div>

        {/* Categories */}
        <div className="flex justify-center">
          {/* Am eliminat filtrarea CATEGORIES, deoarece nu mai este nevoie de categorySearch */}
          {CATEGORIES.map((cat) => (
            <Link to={cat.path} key={cat.title} className="block w-full max-w-xl">
              <div
                className={`p-6 md:p-8 rounded-xl cursor-pointer shadow hover:shadow-md transition ${cat.color} text-center`}
              >
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {cat.title}
                </h3>
                <p className="text-lg text-gray-200 mt-1">
                  Descopera {cat.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;