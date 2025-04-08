import React, { useState } from "react";

const CATEGORIES = [
  { title: "Math", color: "bg-blue-100", emoji: "📐" },
  { title: "Science", color: "bg-green-100", emoji: "🧪" },
  { title: "History", color: "bg-yellow-100", emoji: "🏛️" },
  { title: "Languages", color: "bg-pink-100", emoji: "🗣️" },
];

const Home = () => {
  const [categorySearch, setCategorySearch] = useState("");

  const handleCategoryChange = (e) => {
    e.preventDefault();

    setCategorySearch(e.target.value);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
      <p className="text-gray-600 mb-6">Ready to learn something new today?</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search topics..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={categorySearch}
        onChange={handleCategoryChange}
      />

      {/* Categories */}
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.filter((cat) =>
          cat.title.toLowerCase().includes(categorySearch)
        ).map((cat) => (
          <div
            key={cat.title}
            className={`p-4 rounded-xl cursor-pointer shadow hover:shadow-md transition ${cat.color}`}
          >
            <div className="text-4xl mb-2">{cat.emoji}</div>
            <h3 className="text-lg font-semibold">{cat.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Explore {cat.title} lessons
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
