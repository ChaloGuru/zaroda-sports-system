import { useGames } from '@/hooks/useGames';
import { useSchools } from '@/hooks/useSchools';
import { useParticipants } from '@/hooks/useParticipants';
import { useChampionships } from '@/hooks/useChampionships';
import { CategoryCard } from '@/components/CategoryCard';
import { StatsCard } from '@/components/StatsCard';
import { Navbar } from '@/components/Navbar';
import { GameCategory, CATEGORY_LABELS, LEVEL_LABELS } from '@/types/database';
import { Loader2, Trophy, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const categories: GameCategory[] = ['ball_games', 'athletics', 'music', 'other'];

const Index = () => {
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: participants = [], isLoading: participantsLoading } = useParticipants();
  const { data: championships = [] } = useChampionships();

  const isLoading = gamesLoading || schoolsLoading || participantsLoading;

  const getGameCount = (category: GameCategory) => 
    games.filter(g => g.category === category).length;

  const qualifiedCount = participants.filter(p => p.is_qualified).length;

  // Upcoming championships
  const upcomingChamps = championships.filter(c => {
    if (!c.start_date) return true;
    return new Date(c.start_date) >= new Date(new Date().toDateString());
  }).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">Kenya School Sports Federation</span>
            </div>
<h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider mb 6">LYNEZ SPORTS</h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Track competitions from Zone to National level. Follow results from anywhere — view participants, results, and qualifiers across all sporting categories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.slice(0, 2).map(cat => (
                <Link key={cat} to={`/category/${cat}`} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                  {CATEGORY_LABELS[cat]}<ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Total Games" value={games.length} icon="target" />
              <StatsCard title="Participants" value={participants.length} icon="users" />
              <StatsCard title="Schools" value={schools.length} icon="location" />
              <StatsCard title="Qualified" value={qualifiedCount} icon="trophy" />
            </div>
          )}
        </div>
      </section>

      {/* Championships */}
      {upcomingChamps.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl text-foreground mb-6">UPCOMING CHAMPIONSHIPS</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingChamps.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-display text-xl text-foreground">{c.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{LEVEL_LABELS[c.level]}</Badge>
                  </div>
                  {c.location && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{c.location}
                    </p>
                  )}
                  {c.start_date && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{c.start_date}{c.end_date ? ` — ${c.end_date}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">BROWSE BY CATEGORY</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Select a category to view all games, participants, and results</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <CategoryCard key={category} category={category} gameCount={getGameCount(category)} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-display text-xl">Z</span>
              </div>
<span className="font-display text-2xl tracking-wider">LYNEZ SPORTS</span>
            </div>
            <p className="text-primary-foreground/60 text-sm">© 2026 Zaroda Sports System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
