import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGames';
import { useParticipants } from '@/hooks/useParticipants';
import { Navbar } from '@/components/Navbar';
import { ParticipantsTable } from '@/components/ParticipantsTable';
import { StatsCard } from '@/components/StatsCard';
import { LEVEL_LABELS, CATEGORY_LABELS } from '@/types/database';
import { Loader2, ChevronLeft, Clock, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { data: game, isLoading: gameLoading } = useGame(gameId || '');
  const { data: participants = [], isLoading: participantsLoading } = useParticipants(gameId);

  const isLoading = gameLoading || participantsLoading;

  // Sort participants: by position if available, otherwise by time for timed events
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    if (a.position) return -1;
    if (b.position) return 1;
    if (game?.is_timed && a.time_taken && b.time_taken) {
      return a.time_taken - b.time_taken;
    }
    return 0;
  });

  const qualifiedCount = participants.filter(p => p.is_qualified).length;
  const winner = sortedParticipants.find(p => p.position === 1);

  if (!gameId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Game Not Found</h1>
          <Link to="/" className="text-secondary hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : !game ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Game Not Found</h1>
          <Link to="/" className="text-secondary hover:underline">Return Home</Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-navy text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Link 
                to={`/category/${game.category}`}
                className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {CATEGORY_LABELS[game.category]}
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge className="bg-secondary text-secondary-foreground">
                  {LEVEL_LABELS[game.level]}
                </Badge>
                {game.is_timed && (
                  <Badge variant="outline" className="border-white/30 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    Timed Event
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-5xl tracking-wider">
                {game.name}
              </h1>
              {game.description && (
                <p className="text-white/70 mt-2 max-w-2xl">
                  {game.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatsCard 
                title="Participants" 
                value={participants.length} 
                icon="users" 
              />
              <StatsCard 
                title="Qualified" 
                value={`${qualifiedCount}/${game.max_qualifiers}`} 
                icon="trophy" 
              />
              <StatsCard 
                title="Schools" 
                value={new Set(participants.map(p => p.school_id)).size} 
                icon="location" 
              />
              {winner && (
                <StatsCard 
                  title="Leader" 
                  value={`${winner.first_name} ${winner.last_name}`} 
                  icon="trophy" 
                />
              )}
            </div>

            {/* Participants Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-foreground">
                  PARTICIPANTS & RESULTS
                </h2>
              </div>
              <ParticipantsTable 
                participants={sortedParticipants} 
                isTimed={game.is_timed} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GamePage;
