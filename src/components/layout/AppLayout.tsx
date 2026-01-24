import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScrollProgressBar } from '@/components/ui/scroll-progress-bar';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ScrollProgressBar />
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="md:ml-64 flex-1">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6 md:justify-end"
        >
          {/* Mobile Nav Button */}
          <MobileNav />
          <ThemeToggle />
        </motion.header>
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
