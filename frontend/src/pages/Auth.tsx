import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { env } from '@/config/env';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${env.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });


      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.name}!`,
        });
        
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro ao fazer login",
          description: data.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-teal-900 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-teal-500/10 animate-pulse" />
      
      {/* Glass Card */}
      <Card className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent" style={{ lineHeight: '1.2', paddingBottom: '0.1em' }}>
            AgendaFlow
          </h1>
        </div>
        
        <h2 className="text-center text-gray-300 mb-8">Acesso Administrativo</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              "Entrando..."
            ) : (
              <>
                <LogIn className="mr-2 w-5 h-5" />
                Entrar
              </>
            )}
          </Button>
        </form>

        {/* Terms */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="text-purple-400 hover:text-purple-300">
            Termos de Serviço
          </a>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
