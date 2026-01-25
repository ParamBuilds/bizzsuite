import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/ui/dynamic-hero';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Package, 
  Wallet, 
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Download,
  WifiOff
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ModeSwitcher } from '@/components/ModeSwitcher';

const features = [
  {
    icon: BarChart3,
    title: 'Smart Dashboard',
    description: 'Real-time insights into revenue, profit, and business performance at a glance.',
  },
  {
    icon: Users,
    title: 'CRM Lite',
    description: 'Track customers, manage relationships, and never miss a follow-up.',
  },
  {
    icon: FileText,
    title: 'GST Invoicing',
    description: 'Create professional invoices with automatic GST calculations and PDF export.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, get low-stock alerts, and manage products effortlessly.',
  },
  {
    icon: Wallet,
    title: 'Expense Tracking',
    description: 'Categorize expenses, track spending, and maintain financial clarity.',
  },
  {
    icon: Shield,
    title: 'Compliance Ready',
    description: 'Built-in audit logs, DPDP compliance tools, and GST-ready reports.',
  },
];

const benefits = [
  'Works completely offline',
  'India-friendly GST support',
  'Mobile responsive design',
  'Dark mode for comfort',
  'Immutable audit logs',
  'Privacy & DPDP compliant',
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  }
};

export default function LandingPage() {
  const navigate = useNavigate();

  const navItems = [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'benefits', label: 'Benefits', href: '#benefits' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'login', label: 'Login', onClick: () => navigate('/auth') },
  ];

  return (
    <div className="relative bg-background overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/5 via-accent/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-success/5 via-primary/5 to-transparent blur-3xl" />
      </div>

      {/* Mode Switcher & Theme toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ModeSwitcher />
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <HeroSection
        heading="Run Your Business Smarter"
        tagline="All-in-one platform for invoicing, inventory, expenses, and customer management. Built for Indian SMBs. Works offline."
        buttonText="Start Free Trial"
        navItems={navItems}
        onButtonClick={() => navigate('/auth')}
      />

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 md:px-8 bg-gradient-to-b from-muted/20 via-muted/40 to-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful Features</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for small and medium businesses in India.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Why Choose Us</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Built for Real Businesses
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-10 leading-relaxed">
                We understand the challenges of running a business in India. That's why BizSuite is designed to be simple, powerful, and works even without internet.
              </motion.p>
              
              <motion.ul variants={staggerContainer} className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    variants={fadeInUp}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <span className="text-foreground font-medium">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 rounded-3xl blur-2xl" />
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-card via-card/95 to-muted/50 border border-border/50 p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-5 h-full">
                  {[
                    { label: 'Revenue', value: '₹12.5L', color: 'from-primary to-primary/60', delay: 0 },
                    { label: 'Customers', value: '245', color: 'from-accent to-accent/60', delay: 0.1 },
                    { label: 'Invoices', value: '1.2K', color: 'from-success to-success/60', delay: 0.2 },
                    { label: 'Growth', value: '+28%', color: 'from-warning to-warning/60', delay: 0.3 },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: stat.delay, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="p-5 rounded-2xl bg-card shadow-lg border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                    >
                      <div className={`h-2 w-14 bg-gradient-to-r ${stat.color} rounded-full mb-4`} />
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-4 md:px-8 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Simple Pricing</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Transparent & Fair Pricing
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {/* Free Trial */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative flex flex-col p-8 rounded-3xl bg-card border-2 border-border/50 shadow-xl hover:shadow-2xl hover:border-border transition-all duration-300"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free Trial</h3>
                <p className="text-muted-foreground">Try all features free</p>
              </div>
              <p className="text-5xl font-bold text-foreground mb-2">
                ₹0<span className="text-lg font-normal text-muted-foreground">/14 days</span>
              </p>
              <ul className="space-y-4 my-8 flex-1">
                {['All features unlocked', 'No credit card required', 'Full offline access', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                size="lg"
                className="w-full mt-auto text-lg py-6"
              >
                Start Free Trial
              </Button>
            </motion.div>

            {/* Offline Forever - Featured */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative flex flex-col p-8 rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-4 py-2 bg-white/20 backdrop-blur-sm text-sm font-semibold rounded-bl-2xl">
                ✨ Best Value
              </div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <WifiOff className="h-6 w-6" />
                  <h3 className="text-2xl font-bold">Offline Forever</h3>
                </div>
                <p className="opacity-80 mb-6">Download & own forever</p>
                <p className="text-5xl font-bold mb-2">
                  ₹1,299<span className="text-lg font-normal opacity-80"> one-time</span>
                </p>
                <ul className="space-y-4 my-8 flex-1">
                  {['Downloadable ZIP with installer', 'Works 100% offline', 'Lifetime license key', 'All features included', 'Pay via UPI (GPay/PhonePe)'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Download className="h-5 w-5 opacity-80" />
                      <span className="opacity-95">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 mt-auto text-lg py-6 font-bold shadow-lg"
                >
                  Buy Now with UPI
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Get Started Today</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Indian businesses already using BizSuite to streamline their operations.
          </p>
          <motion.button
            onClick={() => navigate('/auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300"
          >
            Get Started Now — It's Free
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3">
            <p className="text-lg font-medium text-foreground">© 2024 BizSuite</p>
            <p className="text-muted-foreground">Built with ❤️ for Indian SMBs.</p>
            <p className="text-xs text-muted-foreground/70">
              This software provides compliance tooling and does not constitute legal advice. Not affiliated with Government of India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
