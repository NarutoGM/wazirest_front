import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signIn } from '../../../src/services/auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios'; // Asegúrate de importar axios

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Sign in with Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const { user, jwt } = await signIn({
            email: credentials.email,
            password: credentials.password,
          });
          return { ...user, jwt };
        } catch (error) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 72, // 72 horas
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user , account, profile }) {
      if (account?.provider === 'google' && account.access_token) {
        try {
          const googleEmail = profile?.email;
    
          // CONSULTA A STRAPI SI YA EXISTE EL USUARIO POR CORREO
          const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?filters[email][$eq]=${googleEmail}`, {
            headers: {
              Authorization: `Bearer ${process.env.PUBLIC_BACKEND_READ_TOKEN}`, // Necesitas un token de admin aquí
            },
          });
          
          const users = await response.json();
    
          if (users && users.length > 0) {
            const existingUser = users[0];
            const callbackRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/google/callback?access_token=${account.access_token}`);
            const data = await callbackRes.json();

            token.jwt = data.jwt; // o algún jwt válido si tienes manera
            token.id = existingUser.id;
            token.username = existingUser.username;
            token.email = existingUser.email;
            token.roleName = existingUser.role?.name;
    
          } else {
            // Si NO existe, lo registras por Google normalmente (Strapi crea nuevo)
            const callbackRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/google/callback?access_token=${account.access_token}`);
            const data = await callbackRes.json();
    
            token.jwt = data.jwt;
            token.id = data.user.id;
            token.username = data.user.username;
            token.email = data.user.email;
            token.roleName = data.user.role?.name;


            // Agregar la función createNewInstance aquí
            const createNewInstance = async () => {
              try {
                const response = await axios.post(
                  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || (() => { throw new Error('NEXT_PUBLIC_N8N_WEBHOOK_URL is not defined'); })(),
                  {
                    users: data.user.id, // Usar el ID del nuevo usuario
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${data.jwt}`, // Usar el JWT del nuevo usuario
                      'Content-Type': 'application/json',
                    },
                  }
                );
                console.log('Nueva instancia creada con éxito'); // Usar console.log en lugar de toast en el servidor
              } catch (error: any) {
                console.error('Error al crear nueva instancia:', error.response?.data || error.message);
              }
            };

            // Llamar a la función
            await createNewInstance();


          }
    
        } catch (err) {
          console.error("Error unificando cuentas:", err);
        }
      } else if (account?.provider === 'credentials') {
        if (user) {
          token.jwt = user.jwt;
          token.id = Number(user.id);
          token.username = user.username;
          token.email = user.email;
          token.roleName = user.role?.name;
        }
      }
    
      return token;
    },
    

    async session({ session, token }) {
      session.id = token.id;
      session.jwt = token.jwt;
      session.username = token.username;
      session.email = token.email;
      session.roleName = token.roleName;
      return session;
    },
  },
};

export default NextAuth(authOptions);
