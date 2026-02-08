import { useParticipants } from '@/hooks/useParticipants';
import { useGames } from '@/hooks/useGames';
import { useSchools } from '@/hooks/useSchools';
import { Navbar } from '@/components/Navbar';
import { LEVEL_LABELS, GENDER_LABELS, SCHOOL_LEVEL_LABELS, CompetitionLevel, Gender, SchoolLevel } from '@/types/database';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const QualifiedTeamsPage = () => {
  const { data: participants = [], isLoading: pLoading } = useParticipants();
  const { data: games = [], isLoading: gLoading } = useGames();
  const { data: schools = [] } = useSchools();

  const [levelFilter, setLevelFilter] = useState<CompetitionLevel | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [schoolLevelFilter, setSchoolLevelFilter] = useState<SchoolLevel | 'all'>('all');

  const isLoading = pLoading || gLoading;

  const gameMap = useMemo(() => new Map(games.map(g => [g.id, g])), [games]);

  const qualifiedParticipants = useMemo(() => {
    return participants.filter(p => {
      if (!p.is_qualified) return false;
      const game = gameMap.get(p.game_id);
      if (!game) return false;
      if (levelFilter !== 'all' && game.level !== levelFilter) return false;
      if (genderFilter !== 'all' && game.gender !== genderFilter) return false;
      if (schoolLevelFilter !== 'all' && game.school_level !== schoolLevelFilter) return false;
      return true;
    });
  }, [participants, gameMap, levelFilter, genderFilter, schoolLevelFilter]);

  // Group by game
  const groupedByGame = useMemo(() => {
    const map = new Map<string, typeof qualifiedParticipants>();
    for (const p of qualifiedParticipants) {
      const key = p.game_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [qualifiedParticipants]);

  const nextLevel = (level: CompetitionLevel): string => {
    const order: CompetitionLevel[] = ['zone', 'subcounty', 'county', 'region', 'national'];
    const idx = order.indexOf(level);
    if (idx < order.length - 1) return LEVEL_LABELS[order[idx + 1]];
    return 'Champions';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="bg-gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">QUALIFIED TEAMS</h1>
          </div>
          <p className="text-white/70 mt-2">Teams and individuals proceeding to the next level</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as CompetitionLevel | 'all')}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gender</SelectItem>
              <SelectItem value="boys">Boys</SelectItem>
              <SelectItem value="girls">Girls</SelectItem>
            </SelectContent>
          </Select>
          <Select value={schoolLevelFilter} onValueChange={(v) => setSchoolLevelFilter(v as SchoolLevel | 'all')}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All School Levels</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="junior_secondary">Junior Secondary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
        ) : groupedByGame.size === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No qualified participants yet</p></div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupedByGame.entries()).map(([gameId, players]) => {
              const game = gameMap.get(gameId);
              if (!game) return null;
              return (
                <div key={gameId} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl text-foreground">{game.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{LEVEL_LABELS[game.level]}</Badge>
                        <Badge variant="outline" className={game.gender === 'boys' ? 'border-blue-400 text-blue-600' : 'border-pink-400 text-pink-600'}>
                          {GENDER_LABELS[game.gender]}
                        </Badge>
                        <Badge variant="outline">{SCHOOL_LEVEL_LABELS[game.school_level]}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      Proceeding to {nextLevel(game.level)}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>School/Team</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.sort((a, b) => (a.position || 999) - (b.position || 999)).map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                          <TableCell>{p.school?.name || schools.find(s => s.id === p.school_id)?.name || '-'}</TableCell>
                          <TableCell>{p.position || '-'}</TableCell>
                          <TableCell>{p.score ?? '-'}</TableCell>
                          <TableCell>
                            <Badge className="bg-success text-success-foreground">
                              <CheckCircle2 className="w-3 h-3 mr-1" />Qualified
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QualifiedTeamsPage;
