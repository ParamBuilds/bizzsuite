import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Wallet, 
  BarChart3, 
  Settings,
  LogOut,
  Building2,
  Menu,
  Truck,
  Archive,
  ClipboardCheck,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Expenses', href: '/expenses', icon: Wallet },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Evidence Vault', href: '/evidence-vault', icon: Archive },
  { name: 'Inspection Mode', href: '/inspection-mode', icon: ClipboardCheck },
  { name: 'Privacy', href: '/privacy', icon: Shield },
  { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { business, profile } = useBusiness();

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 gradient-sidebar border-sidebar-border">
        <SheetHeader className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <SheetTitle className="font-display font-semibold text-sidebar-accent-foreground truncate max-w-[140px] text-left">
                {business?.name || 'BizSuite'}
              </SheetTitle>
              <span className="text-xs text-sidebar-foreground/60">Business Platform</span>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-medium">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {profile?.role || 'Owner'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="sidebar-item w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
