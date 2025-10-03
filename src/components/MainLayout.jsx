import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, Users, ClipboardList, Menu } from 'lucide-react';
import { toggleSidebar } from '@/store/uiSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector((state) => state.ui.sidebarCollapsed);

  const navItems = [
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/candidates', icon: Users, label: 'Candidates' },
    { to: '/assessments', icon: ClipboardList, label: 'Assessments' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!sidebarCollapsed && (
            <h1 className="bg-gradient-primary bg-clip-text text-xl font-bold text-transparent">
              TalentFlow
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent',
                  isActive && 'bg-sidebar-accent text-sidebar-primary font-medium'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
              HR
            </div>
            {!sidebarCollapsed && (
              <div className="text-sm">
                <p className="font-medium text-sidebar-foreground">HR Team</p>
                <p className="text-xs text-sidebar-foreground/60">Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
