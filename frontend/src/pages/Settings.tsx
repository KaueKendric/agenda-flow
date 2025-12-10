import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authService } from '@/lib/api'
import { User, Lock, Briefcase, Clock } from 'lucide-react'
import { EditProfileTab } from '@/components/settings/EditProfileTab'
import { ChangePasswordTab } from '@/components/settings/ChangePasswordTab'
import { ManageServicesTab } from '@/components/settings/ManageServicesTab'
import { WorkScheduleTab } from '@/components/settings/WorkScheduleTab'

export default function Settings() {
  const navigate = useNavigate()
  const [user] = useState(() => authService.getStoredUser())
  const [loading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/auth')
    }
  }, [navigate])

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <User className="h-8 w-8" />
                  Configurações
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie seu perfil, serviços e configurações
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger value="password" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Senha
                  </TabsTrigger>
                  {(user?.role === 'PROFESSIONAL' || user?.role === 'ADMIN') && (
                    <>
                      <TabsTrigger value="services" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Serviços
                      </TabsTrigger>
                      <TabsTrigger value="schedule" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Horários
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <EditProfileTab user={user} loading={loading} />
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <ChangePasswordTab />
                </TabsContent>

                {(user?.role === 'PROFESSIONAL' || user?.role === 'ADMIN') && (
                  <>
                    <TabsContent value="services" className="space-y-4">
                      <ManageServicesTab loading={loading} />
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                      <WorkScheduleTab professional={null} loading={loading} />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
