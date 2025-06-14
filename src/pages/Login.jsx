// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    // Stări pentru câmpurile formularului
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Stări pentru UI/feedback
    const [error, setError] = useState(null);
    const [isRegisterMode, setIsRegisterMode] = useState(false); // Comută între login și înregistrare
    const [loading, setLoading] = useState(false); // Indică starea de încărcare/procesare

    // Hook-uri React Router și Context
    const navigate = useNavigate();
    const { login: authContextLogin } = useContext(AuthContext); // Redenumim `login` din context pentru claritate

    // Funcție ajutătoare pentru a goli toate câmpurile formularului și erorile
    const clearFormFields = () => {
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setError(null); // Golește și mesajele de eroare
    };

    // Gestionează trimiterea formularului de login
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Previne reîncărcarea paginii
        setError(null);     // Resetează orice eroare anterioară
        setLoading(true);   // Activează starea de încărcare

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            authContextLogin(token, user); // Autentifică utilizatorul prin context

           
            clearFormFields(); // Golește câmpurile după un login reușit

            // Redirecționare bazată pe rolul utilizatorului
            if (user.role === 'admin') {
                navigate('/admin/lessons');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Eroare la login:', err);
            // Gestionează diferite tipuri de erori HTTP
            if (err.response) {
                // Eroare primită de la server (ex: 401 Unauthorized, 400 Bad Request)
                setError(err.response.data.message || 'Email sau parolă incorecte.');
            } else if (err.request) {
                // Cererea a fost făcută, dar nu a primit răspuns (server inaccesibil)
                setError('Niciun răspuns de la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                // Altceva a cauzat eroarea
                setError(`A apărut o eroare: ${err.message}`);
            }
        } finally {
            setLoading(false); // Dezactivează starea de încărcare indiferent de rezultat
        }
    };

    // Gestionează trimiterea formularului de înregistrare
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Previne reîncărcarea paginii
        setError(null);     // Resetează orice eroare anterioară
        setLoading(true);   // Activează starea de încărcare

        // Validare simplă pe frontend pentru parolă
        if (password.length < 8) {
            setError('Parola trebuie să aibă cel puțin 8 caractere.');
            setLoading(false);
            return; // Oprește execuția funcției
        }

        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                // Rolul implicit este "user", nu trimitem "role" explicit decât dacă ar fi cazul de admin
            });

            const { token, user } = response.data; // Backend-ul ar trebui să returneze user și token la înregistrare
            authContextLogin(token, user); // Autentifică utilizatorul imediat după înregistrare

           
            clearFormFields(); // Golește câmpurile după înregistrare reușită

            // Redirecționează noul utilizator către pagina principală
            navigate('/');
        } catch (err) {
            console.error('Eroare la înregistrare:', err);
            // Gestionează diferite tipuri de erori HTTP
            if (err.response) {
                setError(err.response.data.message || 'A apărut o eroare la înregistrare.');
            } else if (err.request) {
                setError('Niciun răspuns de la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                setError(`A apărut o eroare: ${err.message}`);
            }
        } finally {
            setLoading(false); // Dezactivează starea de încărcare indiferent de rezultat
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
                    {isRegisterMode ? 'Înregistrează-te' : 'Autentifică-te'}
                </h2>

                {/* Afișează mesajele de eroare, dacă există */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <strong className="font-bold">Eroare:</strong>
                        <span className="block sm:inline ml-1">{error}</span>
                    </div>
                )}

                <form onSubmit={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit}>
                    {/* Câmpuri specifice pentru modul de înregistrare */}
                    {isRegisterMode && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="firstName">
                                    Nume:
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-150"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required={isRegisterMode}
                                    autoComplete="off" // Previne autofill-ul browserului
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="lastName">
                                    Prenume:
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-150"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required={isRegisterMode}
                                    autoComplete="off" // Previne autofill-ul browserului
                                />
                            </div>
                        </>
                    )}

                    {/* Câmpuri comune pentru login și înregistrare */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-150"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off" // Previne autofill-ul browserului
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Parolă:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-700 transition duration-150"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password" // Sfătuiește browserul să nu completeze automat parole vechi
                        />
                    </div>

                    {/* Butonul de submit */}
                    <button
                        type="submit"
                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 shadow-md hover:shadow-lg"
                        disabled={loading} // Dezactivează butonul în timpul procesării
                    >
                        {loading ? 'Se procesează...' : (isRegisterMode ? 'Înregistrează-te' : 'Autentifică-te')}
                    </button>
                </form>

                {/* Comutare între modurile Login și Înregistrare */}
                <div className="mt-6 text-center text-gray-600 text-sm">
                    {isRegisterMode ? (
                        <span>
                            Ai deja un cont?{' '}
                            <button
                                type="button"
                                onClick={() => { setIsRegisterMode(false); clearFormFields(); }} // Comută și golește câmpurile
                                className="text-red-700 hover:text-red-900 font-semibold focus:outline-none"
                            >
                                Autentifică-te aici.
                            </button>
                        </span>
                    ) : (
                        <span>
                            Nu ai un cont?{' '}
                            <button
                                type="button"
                                onClick={() => { setIsRegisterMode(true); clearFormFields(); }} // Comută și golește câmpurile
                                className="text-red-700 hover:text-red-900 font-semibold focus:outline-none"
                            >
                                Înregistrează-te acum.
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;