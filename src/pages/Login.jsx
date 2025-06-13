// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importăm AuthContext-ul tău

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Aici obținem funcția `login` din context

    const handleSubmit = async (e) => {
        e.preventDefault(); // Oprește reîncărcarea paginii la trimiterea formularului
        setError(null); // Resetează mesajele de eroare

        try {
            // Trimitem cererea POST către ruta de login din backend
            // Asigură-te că URL-ul este corect!
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password,
            });

            // Backend-ul tău returnează { token, user } la login de succes.
            // Le extragem din răspuns.
            const { token, user } = response.data;

            // Apelăm funcția `login` din context pentru a salva token-ul și informațiile despre user
            // în `localStorage` și în starea aplicației.
            login(token, user);

            alert(`Login reușit! Bun venit, ${user.email} (Rol: ${user.role})`);
            
            // Redirecționăm utilizatorul în funcție de rol sau la o pagină specifică
            if (user.role === 'admin') {
                navigate('/lessons/new'); // Ex: Redirecționează adminul la pagina de creare lecții
            } else {
                navigate('/'); // Ex: Redirecționează utilizatorul obișnuit la homepage
            }
        } catch (err) {
            console.error('Eroare la login:', err);
            if (err.response) {
                // Eroare primită de la server (ex: 401 Unauthorized, 400 Bad Request)
                setError(err.response.data.message || 'Email sau parolă incorecte.');
            } else if (err.request) {
                // Cererea a fost făcută, dar nu s-a primit răspuns (ex: server oprit, problemă de rețea)
                setError('Niciun răspuns de la server. Verifică conexiunea la internet sau dacă serverul backend rulează.');
            } else {
                // Altă eroare apărută la configurarea cererii
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

export default Login; // Asigură-te că numele exportat se potrivește cu cel din rutele tale React