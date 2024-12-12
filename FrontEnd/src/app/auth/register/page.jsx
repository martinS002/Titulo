"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Error de Supabase:', authError);
        throw authError;
      }

      // Actualiza el perfil del usuario en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: email })
        .eq('id', authData.user.id); // Utiliza el id del usuario creado para actualizar su perfil

      if (profileError) {
        console.error('Error al actualizar el email en la tabla profiles:', profileError);
        throw profileError;
      }

      setSuccess(true);
      setEmail('');
      setPassword('');

      setTimeout(() => {
        router.push('login');
      }, 3000);

    } catch (err) {
      setError(`Error al registrar el usuario: ${err.message}`);
      console.error('Detalles del error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Registro de Usuario</h2>
        {success ? (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p className="font-bold">¡Registro exitoso!</p>
            <p>Serás redirigido a la página de inicio de sesión en unos segundos...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
              >
                Registrar
              </button>
            </form>
          </>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <a href="login" className="font-medium text-orange-600 hover:text-orange-500">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
