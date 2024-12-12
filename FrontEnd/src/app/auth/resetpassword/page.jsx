'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) {
        router.push('login');
      }
    };
  
    checkSession();
  }, [router]);
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
  
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
  
      if (error) throw error;
  
      setMessage('Contraseña actualizada con éxito. Por favor, vuelve a iniciar sesión.');
      setNewPassword('');
  
      setTimeout(() => {
        router.push('login'); 
      }, 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      console.error(err);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Cambiar Contraseña</h1>
        {message && (
          <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
            <p>{message}</p>
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
