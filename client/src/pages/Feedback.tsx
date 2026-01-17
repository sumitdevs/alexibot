import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Feedback() {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        description: 'Let us know how we\'re doing!',
        variant: 'destructive',
      });
      return;
    }

    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted.',
      });
    }, 500);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank you for your feedback!</h1>
          <p className="text-muted-foreground mb-6">
            Your input helps us improve AlexiBot for everyone.
          </p>
          <Button onClick={() => { setSubmitted(false); setRating(0); setFeedback(''); }}>
            Submit Another
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Help us improve AlexiBot with your suggestions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              Share Your Experience
            </CardTitle>
            <CardDescription>
              Your feedback helps us make AlexiBot better for everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <Label>How would you rate AlexiBot?</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= rating 
                            ? 'fill-warning text-warning' 
                            : 'text-muted-foreground hover:text-warning/50'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="space-y-3">
                <Label htmlFor="feedback">Your Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you love, what could be better, or any features you'd like to see..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" variant="hero">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-muted-foreground">
                Have a bug to report or feature request?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@alexibot.com">Contact Support</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    GitHub Issues
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
