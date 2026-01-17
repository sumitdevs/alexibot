import { BookOpen, Brain, History, Volume2, Bookmark, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Contextual Meanings',
    description: 'Get precise definitions based on how words are used in your specific context, not just generic dictionary entries.',
  },
  {
    icon: Bookmark,
    title: 'Personal Word Bank',
    description: 'Save words you\'re learning with notes, tags, and examples. Build your personalized vocabulary collection.',
  },
  {
    icon: History,
    title: 'History Tracking',
    description: 'Review your learning journey. See past analyses, track progress, and revisit words you\'ve explored.',
  },
  {
    icon: Volume2,
    title: 'Pronunciation (TTS)',
    description: 'Hear how words are pronounced with text-to-speech. Perfect for mastering pronunciation.',
  },
  {
    icon: BookOpen,
    title: 'Rich Examples',
    description: 'See words in action with curated example sentences from real-world usage and literature.',
  },
  {
    icon: TrendingUp,
    title: 'Learning Analytics',
    description: 'Track your vocabulary growth with insights, streaks, and personalized suggestions.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Master Words</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to accelerate your vocabulary learning and language understanding.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
