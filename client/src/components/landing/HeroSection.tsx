import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Vocabulary Analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Understand Words
            <br />
            <span className="gradient-text">in Context, Smarter</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            AlexiBot uses advanced AI to help you understand word meanings in context, build your vocabulary, and track your learning progress—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/login">
                Login to Dashboard
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Words Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">5K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
