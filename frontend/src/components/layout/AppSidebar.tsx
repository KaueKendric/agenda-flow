import { Home, Calendar, Users, UserCheck, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
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
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Agendamentos', url: '/agendamentos', icon: Calendar },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Profissionais', url: '/profissionais', icon: UserCheck },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
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
              {navItems.map((item) => (
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
