import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function middleware(req) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  try {
  
    const { data: { user }, error } = await supabase.auth.getUser(authToken.value)
    if (error || !user) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const isAdminEmail = user.email === 'martin.soto.salinas@gmail.com';

    const restrictedRoutes = ['/inventario', '/proveedores', '/tareas' , '/ventas' , '/tienda/envios' ,'/contactos/contactosclientes'];
    const isRestrictedRoute = restrictedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    if (isRestrictedRoute && !isAdminEmail) {
      console.log('Ruta restringida y usuario no es administrador.')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Error en la verificación del token:', err);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/inventario', '/proveedores', '/tareas' , '/ventas/:path*' , '/tienda/envios' ,'/contactos/contactosclientes'],
};
