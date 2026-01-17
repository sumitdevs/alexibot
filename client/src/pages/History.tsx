import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserHistory } from '@/api/dictionary.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar,
  RotateCcw,
  Bookmark,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HistoryItem {
  id: string;
  date: string;
  selectedText: string;
  result: string;
  source: 'GPT' | 'Dictionary';
  feedback: number | null;
}



export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try { 
        const res = await getUserHistory();
        console.log(res.data.items)
        setHistoryItems(res.data.items);
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }

    fetchHistory();
  }, [])

  const filteredHistory = historyItems.filter(item => {
    const matchesSearch = item.lemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.result.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesFeedback = feedbackFilter === 'all' || 
                           (feedbackFilter === 'rated' && item.feedback !== null) ||
                           (feedbackFilter === 'unrated' && item.feedback === null);
    
    return matchesSearch && matchesSource && matchesFeedback;
  });

  const renderStars = (rating: number | null) => {
    if (rating === null) return <span className="text-xs text-muted-foreground">Not rated</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">History</h1>
          <p className="text-muted-foreground mt-1">
            Your past analyses and word lookups • {historyItems.length} entries
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="GPT">AI (GPT)</SelectItem>
                <SelectItem value="Dictionary">Dictionary</SelectItem>
              </SelectContent>
            </Select>
            <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Feedback" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="rated">Rated</SelectItem>
                <SelectItem value="unrated">Unrated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* History Table */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Selected Text</div>
              <div className="col-span-3">Result</div>
              <div className="col-span-1">Source</div>
              <div className="col-span-1">Rating</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-secondary/50 transition-colors"
                >
                  {/* Date */}
                  <div className="sm:col-span-2 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground sm:hidden" />
                    <span className="text-muted-foreground">{new Date(item.created_at).toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'})}</span>
                  </div>
                  
                  {/* Selected Text */}
                  <div className="sm:col-span-4">
                    <p className="text-sm font-medium line-clamp-2">{item.lemma}</p>
                  </div>
                  
                  {/* Result */}
                  <div className="sm:col-span-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.gloss.split(";")[0]}</p>
                  </div>
                  
                  {/* Source */}
                  <div className="sm:col-span-1">
                    <Badge variant={item.source === 'GPT' ? 'default' : 'secondary'} className="text-xs">
                      {item.source}
                    </Badge>
                  </div>
                  
                  {/* Feedback */}
                  <div className="sm:col-span-1">
                    {renderStars(item.feedback)}
                  </div>
                  
                  {/* Actions */}
                  <div className="sm:col-span-1 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Re-run analysis">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Save to Word Bank">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredHistory.length} of {historyItems.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
