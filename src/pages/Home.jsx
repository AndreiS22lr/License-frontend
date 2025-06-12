import React, { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { title: "Lectii", color: "bg-red-700", emoji: "📚", path: "/lessons" },
  { title: "Exercitii", color: "bg-red-700", emoji: "📝", path: "/exercises" },
  { title: "Cantari", color: "bg-red-700", emoji: "🎶", path: "/songs" },
];

const Home = () => {
  const [categorySearch, setCategorySearch] = useState("");

  const handleCategoryChange = (e) => {
    e.preventDefault();
    setCategorySearch(e.target.value);
  };

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
            Explorează lecții, exerciții și cântări.
          </p>
        </div>
      </div>

      {/* Main Content: Restul conținutului paginii (căutare, categorii) */}
      <div className="p-6 max-w-5xl mx-auto">
        {/* Search */}
        <input
          type="text"
          placeholder="Căutare..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={categorySearch}
          onChange={handleCategoryChange}
        />

        {/* descriere */}
        <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-lg text-gray-800 font-semibold mb-2">
            „Muzica bizantină este foarte folositoare de suflet. Nu trebuie să existe niciun creștin care să nu cunoască muzica bizantină. Toți trebuie s-o învățăm. Ea are o legătură directă cu sufletul. Muzica îl sfințește pe om fără jertfă. Fără osteneală, veselindu-te, devii sfânt (Cuviosul Porfirie Kafsokalivitul)”
          </p>
          <p className="text-sm text-gray-600">
            Aici vei găsi resurse variate pentru a aprofunda arta și practica muzicii psaltice. De la lecții introductive până la cântări complexe, totul este la îndemâna ta.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.filter((cat) =>
            cat.title.toLowerCase().includes(categorySearch.toLowerCase())
          ).map((cat) => (
            // <-- AICI S-A MUTAT "key={cat.title}"!
            <Link to={cat.path} key={cat.title} className="block">
              <div
                className={`p-4 rounded-xl cursor-pointer shadow hover:shadow-md transition ${cat.color}`}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                {/* Am adăugat text-white aici pentru lizibilitate pe fundalul roșu */}
                <h3 className="text-lg font-semibold text-white">{cat.title}</h3>
                {/* Am adăugat text-gray-200 aici pentru lizibilitate */}
                <p className="text-sm text-gray-200 mt-1">
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