import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/api';

interface UserData {
  id: string;
  email: string;
  name?: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  const user: UserData | null = authService.getStoredUser();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo de volta, {user.name || user.email}!
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border/50 hover:border-destructive hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user.name || 'Usuário'}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6 hover:shadow-glow/20 transition-shadow cursor-pointer group">
              <Calendar className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Agendamentos</h3>
              <p className="text-muted-foreground text-sm">
                Gerencie seus compromissos e horários
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6 hover:shadow-glow/20 transition-shadow cursor-pointer group">
              <User className="w-12 h-12 text-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Perfil</h3>
              <p className="text-muted-foreground text-sm">
                Atualize suas informações pessoais
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-glass bg-card/40 border-border/50 shadow-glass rounded-2xl p-6 hover:shadow-glow/20 transition-shadow cursor-pointer group">
              <Settings className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Configurações</h3>
              <p className="text-muted-foreground text-sm">
                Personalize sua experiência
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
