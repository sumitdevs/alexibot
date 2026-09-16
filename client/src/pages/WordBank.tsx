import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWordBank } from '@/api/dictionary.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Grid3X3, 
  List, 
  Volume2, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Plus,
  Tag,
  X
} from 'lucide-react';

interface Word {
  id: string;
  word: string;
  meaning: string;
  tags: string[];
  dateSaved: string;
  source: 'AI' | 'Dictionary';
}

const wordBanks: Word[] = [
  { id: '1', word: 'Ephemeral', meaning: 'Lasting for a very short time', tags: ['adjective', 'formal'], dateSaved: '2024-01-15', source: 'AI' },
  { id: '2', word: 'Paradigm', meaning: 'A typical example or pattern', tags: ['noun', 'academic'], dateSaved: '2024-01-14', source: 'AI' },
  { id: '3', word: 'Ubiquitous', meaning: 'Present, appearing, or found everywhere', tags: ['adjective'], dateSaved: '2024-01-13', source: 'Dictionary' },
  { id: '4', word: 'Serendipity', meaning: 'The occurrence of events by chance in a happy way', tags: ['noun', 'positive'], dateSaved: '2024-01-12', source: 'AI' },
  { id: '5', word: 'Eloquent', meaning: 'Fluent or persuasive in speaking or writing', tags: ['adjective', 'communication'], dateSaved: '2024-01-11', source: 'AI' },
  { id: '6', word: 'Meticulous', meaning: 'Showing great attention to detail', tags: ['adjective', 'positive'], dateSaved: '2024-01-10', source: 'Dictionary' },
];

export default function WordBank() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordBanks, setWordBanks] = useState([]);

  const filteredWords = wordBanks.filter(word =>
    word.lemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.gloss.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const fetchWordBank = async ()=> {
      try {
        const res = await getWordBank();
        setWordBanks(res.data.items);
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }

    fetchWordBank();
    
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Word Bank</h1>
            <p className="text-muted-foreground mt-1">
              Your personal vocabulary collection • {wordBanks.length} words saved
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Word
            </Button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search words, meanings, tags..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Word List */}
          <div className="flex-1">
            {viewMode === 'list' ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {filteredWords.map((word) => (
                      <div 
                        key={word.id}
                        className={`flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                          selectedWord?.id === word.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedWord(word)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">{word.lemma}</span>
                            <div className="flex gap-1.5">
                                <Badge key={word.pos} variant="secondary" className="text-xs">
                                  {word.pos}
                                </Badge>
                              {/* {word.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{word.tags.length - 2}
                                </Badge>
                              )} */}
                            </div>
                          </div>
                          <p className="text-sm max-w-xl text-muted-foreground mt-1 truncate">
                            {word.gloss}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(word.created_at).toLocaleString('en-IN', {day: "numeric", month: "2-digit", year: "numeric"})}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWords.map((word) => (
                  <Card 
                    key={word.id}
                    className={`cursor-pointer hover:border-primary/30 transition-all ${
                      selectedWord?.id === word.id ? 'border-primary ring-1 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedWord(word)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{word.word}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {word.meaning}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                          <Badge key={word.pos} variant="secondary" className="text-xs">
                            {word.pos}
                          </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{word.dateSaved}</span>
                        <Badge variant="outline" className="text-xs">{word.source}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedWord && (
            <Card className="hidden lg:block w-80 flex-shrink-0 sticky top-6 h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{selectedWord.lemma}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedWord(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Meaning</h4>
                  <p className="text-foreground">{selectedWord.gloss.split(";")[0]}</p>
                </div>

                {/* <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWord.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div> */}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Example</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {selectedWord.gloss.split(";")[1]}
                  </p>
                </div>

                {/* <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    No notes added yet. Click to add personal notes.
                  </p>
                </div> */}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="flex-1" size="sm">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Hear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
