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
  Truck,
  Shield,
  Activity,
  CreditCard,
  HeartPulse,
  Archive,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

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
  { name: 'Health Check', href: '/health', icon: HeartPulse },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const sidebarVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -10, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  }
};

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { business, profile } = useBusiness();

  return (
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar border-r border-sidebar-border"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <motion.div 
          variants={itemVariants}
          className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Building2 className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-sidebar-accent-foreground truncate max-w-[140px]">
              {business?.name || 'BizSuite'}
            </span>
            <span className="text-xs text-sidebar-foreground/60">Business Platform</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                custom={index}
              >
                <NavLink
                  to={item.href}
                  className={cn(
                    'sidebar-item relative overflow-hidden',
                    isActive && 'sidebar-item-active'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-sidebar-accent rounded-lg"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <motion.span 
                    className="relative z-10 flex items-center gap-3"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </motion.span>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* User section */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-sidebar-border p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {profile?.role || 'Owner'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="sidebar-item w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.aside>
  );
};
