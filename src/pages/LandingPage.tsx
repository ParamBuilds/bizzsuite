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
    <div className="relative bg-background">
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
        enableCursorAnimation={true}
      />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
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
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group p-6 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success uppercase tracking-wider">Benefits</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built for Real Businesses
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8">
                We understand the challenges of running a business in India. That's why BizSuite is designed to be simple, powerful, and works even without internet.
              </motion.p>
              
              <motion.ul variants={staggerContainer} className="space-y-4">
                {benefits.map((benefit) => (
                  <motion.li
                    key={benefit}
                    variants={fadeInUp}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
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
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {[
                    { label: 'Revenue', value: '₹12.5L', color: 'bg-primary' },
                    { label: 'Customers', value: '245', color: 'bg-accent' },
                    { label: 'Invoices', value: '1.2K', color: 'bg-success' },
                    { label: 'Growth', value: '+28%', color: 'bg-warning' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="p-4 rounded-xl bg-card shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300"
                    >
                      <div className={`h-2 w-12 ${stat.color} rounded-full mb-3`} />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Pricing</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
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
              className="flex flex-col p-8 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">Free Trial</h3>
              <p className="text-muted-foreground mb-4 text-sm">Try all features free</p>
              <p className="text-4xl font-bold text-foreground mb-2">
                ₹0<span className="text-lg font-normal text-muted-foreground">/14 days</span>
              </p>
              <ul className="space-y-3 my-6 flex-1">
                {['All features unlocked', 'No credit card required', 'Full offline access', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full mt-auto"
              >
                Start Free Trial
              </Button>
            </motion.div>

            {/* Offline Forever - Featured */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="flex flex-col p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                Best Value
              </div>
              <div className="flex items-center gap-2 mb-2">
                <WifiOff className="h-5 w-5" />
                <h3 className="text-xl font-semibold">Offline Forever</h3>
              </div>
              <p className="opacity-80 mb-4 text-sm">Download & own forever</p>
              <p className="text-4xl font-bold mb-2">
                ₹1,299<span className="text-lg font-normal opacity-80"> one-time</span>
              </p>
              <ul className="space-y-3 my-6 flex-1">
                {['Downloadable ZIP with installer', 'Works 100% offline', 'Lifetime license key', 'All features included', 'Pay via UPI (GPay/PhonePe)'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm opacity-90">
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/pricing')}
                className="w-full bg-white text-primary hover:bg-white/90 mt-auto font-semibold"
              >
                Buy Now with UPI
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Indian businesses already using BizSuite to streamline their operations.
          </p>
          <motion.button
            onClick={() => navigate('/auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          >
            Get Started Now — It's Free
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-muted-foreground space-y-2">
            <p>© 2024 BizSuite. Built with ❤️ for Indian SMBs.</p>
            <p className="text-xs">
              This software provides compliance tooling and does not constitute legal advice. Not affiliated with Government of India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
