import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-teal-900">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-teal-500/10 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkles className="w-12 h-12 text-purple-400" />
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent" style={{ lineHeight: '1.2', paddingBottom: '0.15em' }}>
            AgendaFlow
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Simplifique sua agenda e otimize seu tempo com a plataforma mais moderna de gerenciamento de compromissos
        </p>
        
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          Começar Agora
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
