// src/components/QuizEditor.jsx
import React from 'react';

const QuizEditor = ({
    quizTitle,
    setQuizTitle,
    quizDescription,
    setQuizDescription,
    quizQuestions,
    // setQuizQuestions, // Acest prop nu este folosit direct aici, e ok să-l lași sau să-l ștergi dacă nu e necesar
    quizError,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionTextChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionTextChange,
    handleCorrectAnswerChange, // Aceasta va primi textul opțiunii
    handleQuestionImageChange,
    handleRemoveQuestionImage,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionare Quiz (Opțional)</h2>
            {quizError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Eroare Quiz:</strong>
                    <span className="block sm:inline"> {quizError}</span>
                </div>
            )}

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
                            <div key={`${qIndex}-${oIndex}`} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    key={`radio-${qIndex}-${oIndex}`} // Adăugat: Cheie unică pentru input-ul radio
                                    name={`correctAnswer-${qIndex}`}
                                    value={optionText}
                                    checked={question.correctAnswer === optionText}
                                    onChange={() => handleCorrectAnswerChange(qIndex, optionText)}
                                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                                    // Eliminat 'required' de aici. Validarea poate fi făcută la nivelul formularului principal.
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
        </div>
    );
};

export default QuizEditor;