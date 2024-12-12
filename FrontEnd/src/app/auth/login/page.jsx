'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const InputField = ({ type, value, onChange, placeholder, ariaLabel }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    placeholder={placeholder}
    aria-label={ariaLabel}
  />
);

const SubmitButton = ({ text }) => (
  <button
    type="submit"
    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
  >
    {text}
  </button>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Set authentication token as a cookie
      Cookies.set('auth_token', data.session.access_token, { expires: 7 });

      setSuccess(true);
      setEmail('');
      setPassword('');
      router.push('/');
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, verifique sus credenciales e intente nuevamente.');
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/resetpassword`,
      });

      if (error) throw error;

      setResetMessage('Se ha enviado un correo electrónico para restablecer la contraseña.');
      setResetEmail('');
    } catch (err) {
      setResetMessage(`Error: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h2>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p className="font-bold">¡Inicio de sesión exitoso!</p>
            <p>Bienvenido de vuelta.</p>
          </div>
        )}

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
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              ariaLabel="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              ariaLabel="Contraseña"
            />
          </div>
          <SubmitButton text="Iniciar Sesión" />
        </form>

        <div className="mt-6">
          <h3
            className="mt-4 text-center text-sm text-gray-600 cursor-pointer hover:text-orange-500"
            onClick={() => setShowResetForm(!showResetForm)}
          >
            ¿Olvidaste tu contraseña?
          </h3>

          {showResetForm && (
            <>
              {resetMessage && (
                <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 text-black-700">
                  <p>{resetMessage}</p>
                </div>
              )}
              <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                <InputField
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu@email.com"
                  ariaLabel="Email para restablecer la contraseña"
                />
                <SubmitButton text="Enviar correo de restablecimiento" />
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <a href="register" className="font-medium text-orange-600 hover:text-orange-500">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}