import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from '@/config/env';
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const Debug = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [protectedData, setProtectedData] = useState<Record<string, unknown> | null>(null);

  const checkLocalStorage = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

    const testProtectedRoute = async () => {
    const storedToken = localStorage.getItem("token");
    try {
        const response = await fetch(`${env.apiUrl}/auth/me`, {
        headers: {
            Authorization: `Bearer ${storedToken}`,
        },
        });
        const data = await response.json();
        setProtectedData(data);
    } catch {
        setProtectedData({ error: "Falha ao acessar rota protegida" });
    }
    };


  const clearStorage = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setProtectedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Card className="max-w-4xl mx-auto p-6 bg-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug de Autenticação</h1>

        <div className="space-y-4">
          <Button onClick={checkLocalStorage} className="mr-2">
            Verificar LocalStorage
          </Button>
          <Button onClick={testProtectedRoute} className="mr-2" variant="secondary">
            Testar Rota Protegida
          </Button>
          <Button onClick={clearStorage} variant="destructive">
            Limpar Storage
          </Button>
        </div>

        {token && (
          <div className="mt-6 p-4 bg-green-900/50 rounded">
            <h2 className="font-bold text-lg mb-2">✅ Token:</h2>
            <pre className="text-xs overflow-auto">{token}</pre>
          </div>
        )}

        {user && (
          <div className="mt-4 p-4 bg-blue-900/50 rounded">
            <h2 className="font-bold text-lg mb-2">👤 Usuário:</h2>
            <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}

        {protectedData && (
          <div className="mt-4 p-4 bg-purple-900/50 rounded">
            <h2 className="font-bold text-lg mb-2">🔒 Rota Protegida:</h2>
            <pre className="text-xs">{JSON.stringify(protectedData, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Debug;
