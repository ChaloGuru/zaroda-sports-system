import { useParams, Link } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { useParticipants } from '@/hooks/useParticipants';
import { Navbar } from '@/components/Navbar';
import { GameCard } from '@/components/GameCard';
import { GameCategory, Gender, SchoolLevel, CATEGORY_LABELS, LEVEL_LABELS, GENDER_LABELS, SCHOOL_LEVEL_LABELS, CompetitionLevel } from '@/types/database';
import { Loader2, ChevronLeft, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CategoryPage = () => {
  const { category } = useParams<{ category: GameCategory }>();
  const [levelFilter, setLevelFilter] = useState<CompetitionLevel | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [schoolLevelFilter, setSchoolLevelFilter] = useState<SchoolLevel | 'all'>('all');
  
  const { data: games = [], isLoading } = useGames(category as GameCategory);
  const { data: allParticipants = [] } = useParticipants();

  let filteredGames = games;
  if (levelFilter !== 'all') filteredGames = filteredGames.filter(g => g.level === levelFilter);
  if (genderFilter !== 'all') filteredGames = filteredGames.filter(g => g.gender === genderFilter);
  if (schoolLevelFilter !== 'all') filteredGames = filteredGames.filter(g => g.school_level === schoolLevelFilter);

  const getParticipantCount = (gameId: string) => 
    allParticipants.filter(p => p.game_id === gameId).length;

  if (!category || !['ball_games', 'athletics', 'music', 'other'].includes(category)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Category Not Found</h1>
          <Link to="/" className="text-secondary hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider">
            {CATEGORY_LABELS[category as GameCategory]}
          </h1>
          <p className="text-white/70 mt-2">
            {games.length} games across all competition levels
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as CompetitionLevel | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="zone">Zone</SelectItem>
              <SelectItem value="subcounty">Sub-County</SelectItem>
              <SelectItem value="county">County</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="national">National</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v as Gender | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gender</SelectItem>
              <SelectItem value="boys">Boys</SelectItem>
              <SelectItem value="girls">Girls</SelectItem>
            </SelectContent>
          </Select>
          <Select value={schoolLevelFilter} onValueChange={(v) => setSchoolLevelFilter(v as SchoolLevel | 'all')}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All School Levels</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No games found matching filters</p>
            <Link to="/">
              <Button variant="outline">Browse Other Categories</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                participantCount={getParticipantCount(game.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
