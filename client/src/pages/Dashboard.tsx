import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bookmark, 
  Zap, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Sparkles,
  Volume2,
  Eye,
  Flame
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const mockRecentActivity = [
  { id: 1, word: 'Ephemeral', snippet: 'The ephemeral nature of...', date: '2 hours ago' },
  { id: 2, word: 'Paradigm', snippet: 'A new paradigm shift in...', date: '5 hours ago' },
  { id: 3, word: 'Ubiquitous', snippet: 'Technology has become ubiquitous...', date: 'Yesterday' },
  { id: 4, word: 'Serendipity', snippet: 'By pure serendipity, they...', date: 'Yesterday' },
  { id: 5, word: 'Eloquent', snippet: 'An eloquent speech that...', date: '2 days ago' },
];

const suggestedWords = [
  { word: 'Meticulous', category: 'Adjective' },
  { word: 'Pragmatic', category: 'Adjective' },
  { word: 'Resilience', category: 'Noun' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your learning progress and discover new words.
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/dashboard/word-bank">
              <Sparkles className="w-4 h-4" />
              Analyze New Word
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Words Saved</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">24</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Queries Today</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">12</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">96%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">7</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/history">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentActivity.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.word}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {item.snippet}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Words */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Words to Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedWords.map((item) => (
                <div 
                  key={item.word}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.word}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Practice
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link to="/dashboard/word-bank">
                  View Word Bank
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
