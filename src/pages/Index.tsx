import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Calculator,
  Users
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm text-secondary-foreground backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <span className="text-primary-foreground/90">Income Tax Filing 2026 Now Open</span>
            </div>
            
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl animate-slide-up">
              Professional Income Tax
              <span className="block text-accent">Registration Services</span>
            </h1>
            
            <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Expert tax filing, hassle-free returns, and complete compliance support by Roopsiangbhai Jamod
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="accent" size="xl" asChild>
                <Link to="/register" className="flex items-center gap-2">
                  Register Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/client-login">
                  Client Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Why Choose RupTax?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trusted by hundreds of clients for their tax needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <FileText className="h-6 w-6" />,
                title: "ITR Filing",
                description: "Complete Income Tax Return filing with expert guidance",
              },
              {
                icon: <Calculator className="h-6 w-6" />,
                title: "Tax Planning",
                description: "Strategic planning to minimize your tax liability",
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Quick Process",
                description: "Fast and efficient service with timely filing",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "100% Secure",
                description: "Your data is safe and confidential with us",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-elegant hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-accent text-secondary-foreground">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-display font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-border bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
              Ready to File Your Returns?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Create your account today and get started with hassle-free tax filing
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
