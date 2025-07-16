// Header.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from "../../../lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="w-full bg-gray-900 text-white px-6 shadow-md flex justify-between items-center fixed top-0 left-0 z-50 h-20">
      <div className="text-xl font-bold">rollersAI</div>
      <div className="space-x-4 flex items-center">
        {user ? (
          <>
            <span className="text-sm">Hello, {user.email}</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded">
              Logout
            </button>
          </>
        ) : (
          <button onClick={handleLogin} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
            Login with Google
          </button>
        )}
      </div>
    </header>
  );
}