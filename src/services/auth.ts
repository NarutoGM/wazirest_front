export async function signIn({ email, password }: { email: string; password: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });
  
    const data = await response.json();
  
    if (!response.ok) throw new Error(data.error.message);
  
    return {
      user: data.user,
      jwt: data.jwt,
    };
  }
  