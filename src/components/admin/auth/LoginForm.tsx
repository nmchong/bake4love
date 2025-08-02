"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { isAllowedAdmin } from "@/lib/checkAdminAccess";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    
    if (!isAllowedAdmin(userEmail)) {
      await supabase.auth.signOut();
      setErrorMsg("Unauthorized");
      return;
    }

    router.push("/admin");
  };


  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto mt-12">
      <h1 className="text-4xl font-bold text-center text-[#4A2F1B] mb-2">Bake4Love</h1>
      <h1 className="text-2xl font-bold text-center text-[#4A2F1B] mb-6">Admin Login</h1>
      <input
        type="email"
        className="w-full border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full border p-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button type="submit" className="bg-black text-white px-4 py-2 cursor-pointer">
        Login
      </button>
    </form>
  );
}
