import { MousePointer2, Sparkles, BookmarkPlus, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: MousePointer2,
    step: '01',
    title: 'Select Any Text',
    description: 'Highlight any word or phrase while reading online, in documents, or anywhere else.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Get AI Analysis',
    description: 'AlexiBot instantly provides contextual meanings, synonyms, and usage examples.',
  },
  {
    icon: BookmarkPlus,
    step: '03',
    title: 'Save to Word Bank',
    description: 'Add words to your personal collection with custom notes and tags.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Track Progress',
    description: 'Review your learning journey and get personalized suggestions.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to transform your vocabulary learning experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative flex gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-accent mb-1">STEP {step.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
