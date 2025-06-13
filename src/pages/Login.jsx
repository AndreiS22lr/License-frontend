// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            login(token, user);

            alert(`Login reușit! Bun venit, ${user.email} (Rol: ${user.role})`);
            
            // --- CORECTIE AICI ---
            if (user.role === 'admin') {
                // Redirecționează adminul la pagina unde administrează lecțiile
                // Aceasta este noua rută pe care am configurat-o pentru lista de lecții admin
                navigate('/admin/lessons'); 
            } else {
                // Redirecționează utilizatorul obișnuit la homepage sau la lista publică de lecții
                navigate('/'); // Sau navigate('/lessons');
            }
            // --- SFARSIT CORECTIE ---

        } catch (err) {
            console.error('Eroare la login:', err);
            if (err.response) {
                setError(err.response.data.message || 'Email sau parolă incorecte.');
            } else if (err.request) {
                setError('Niciun răspuns de la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                setError(`A apărut o eroare: ${err.message}`);
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Parolă:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;