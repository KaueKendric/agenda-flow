import { Home, Calendar, Users, UserCheck, Briefcase, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { authService } from '@/lib/api';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

const navItems = [
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: Home,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
  { 
    title: 'Agendamentos', 
    url: '/agendamentos', 
    icon: Calendar,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
  { 
    title: 'Clientes', 
    url: '/clientes', 
    icon: Users,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
  { 
    title: 'Profissionais', 
    url: '/profissionais', 
    icon: UserCheck,
    roles: ['ADMIN']
  },
  { 
    title: 'Serviços', 
    url: '/servicos', 
    icon: Briefcase,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
  { 
    title: 'Relatórios', 
    url: '/relatorios', 
    icon: BarChart3,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
  { 
    title: 'Configurações', 
    url: '/configuracoes', 
    icon: Settings,
    roles: ['ADMIN', 'PROFESSIONAL']
  },
];

export function AppSidebar() {
  const user = authService.getStoredUser();
  const userRole = user?.role || 'CLIENT';

  const visibleItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          AgendaFlow
        </h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 text-xs uppercase tracking-wider">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                      activeClassName="bg-primary/20 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
