import { useGames } from '@/hooks/useGames';
import { useParticipants } from '@/hooks/useParticipants';
import { useSchools } from '@/hooks/useSchools';
import { Navbar } from '@/components/Navbar';
import { 
  LEVEL_LABELS, GENDER_LABELS, SCHOOL_LEVEL_LABELS, TEAM_NAME_BY_LEVEL,
  CompetitionLevel, Gender, SchoolLevel 
} from '@/types/database';
import { Loader2, Trophy, Medal, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface TeamScore {
  schoolId: string;
  schoolName: string;
  zone: string;
  subcounty: string;
  county: string;
  region: string;
  totalScore: number;
  gamesPlayed: number;
  boysScore: number;
  girlsScore: number;
  primaryScore: number;
  juniorSecondaryScore: number;
}

const OverallRankings = () => {
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: participants = [], isLoading: participantsLoading } = useParticipants();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();

  const [levelFilter, setLevelFilter] = useState<CompetitionLevel | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [schoolLevelFilter, setSchoolLevelFilter] = useState<SchoolLevel | 'all'>('all');
  const [locationSearch, setLocationSearch] = useState('');

  const isLoading = gamesLoading || participantsLoading || schoolsLoading;

  const teamScores = useMemo(() => {
    const scoreMap = new Map<string, TeamScore>();
    const gameMap = new Map(games.map(g => [g.id, g]));

    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game) continue;
      if (levelFilter !== 'all' && game.level !== levelFilter) continue;
      if (genderFilter !== 'all' && game.gender !== genderFilter) continue;
      if (schoolLevelFilter !== 'all' && game.school_level !== schoolLevelFilter) continue;

      const score = p.score ?? 0;
      if (!scoreMap.has(p.school_id)) {
        const school = schools.find(s => s.id === p.school_id);
        scoreMap.set(p.school_id, {
          schoolId: p.school_id,
          schoolName: school?.name || 'Unknown',
          zone: school?.zone || '',
          subcounty: school?.subcounty || '',
          county: school?.county || '',
          region: school?.region || '',
          totalScore: 0, gamesPlayed: 0,
          boysScore: 0, girlsScore: 0,
          primaryScore: 0, juniorSecondaryScore: 0,
        });
      }
      const entry = scoreMap.get(p.school_id)!;
      entry.totalScore += score;
      if (game.gender === 'boys') entry.boysScore += score;
      else entry.girlsScore += score;
      if (game.school_level === 'primary') entry.primaryScore += score;
      else entry.juniorSecondaryScore += score;
    }

    const schoolGames = new Map<string, Set<string>>();
    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game) continue;
      if (levelFilter !== 'all' && game.level !== levelFilter) continue;
      if (genderFilter !== 'all' && game.gender !== genderFilter) continue;
      if (schoolLevelFilter !== 'all' && game.school_level !== schoolLevelFilter) continue;
      if (!schoolGames.has(p.school_id)) schoolGames.set(p.school_id, new Set());
      schoolGames.get(p.school_id)!.add(p.game_id);
    }
    for (const [schoolId, gameSet] of schoolGames) {
      const entry = scoreMap.get(schoolId);
      if (entry) entry.gamesPlayed = gameSet.size;
    }

    let results = Array.from(scoreMap.values());
    
    // Filter by location search
    if (locationSearch.trim()) {
      const search = locationSearch.toLowerCase();
      results = results.filter(t =>
        t.schoolName.toLowerCase().includes(search) ||
        t.zone.toLowerCase().includes(search) ||
        t.subcounty.toLowerCase().includes(search) ||
        t.county.toLowerCase().includes(search) ||
        t.region.toLowerCase().includes(search)
      );
    }

    return results.sort((a, b) => b.totalScore - a.totalScore);
  }, [games, participants, schools, levelFilter, genderFilter, schoolLevelFilter, locationSearch]);

  // Best performers
  const bestBoyPrimary = useMemo(() => {
    const gameMap = new Map(games.map(g => [g.id, g]));
    let best: { name: string; score: number; game: string } | null = null;
    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game || game.gender !== 'boys' || game.school_level !== 'primary') continue;
      if (p.score && (!best || p.score > best.score)) {
        best = { name: `${p.first_name} ${p.last_name}`, score: p.score, game: game.name };
      }
    }
    return best;
  }, [games, participants]);

  const bestGirlPrimary = useMemo(() => {
    const gameMap = new Map(games.map(g => [g.id, g]));
    let best: { name: string; score: number; game: string } | null = null;
    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game || game.gender !== 'girls' || game.school_level !== 'primary') continue;
      if (p.score && (!best || p.score > best.score)) {
        best = { name: `${p.first_name} ${p.last_name}`, score: p.score, game: game.name };
      }
    }
    return best;
  }, [games, participants]);

  const bestBoyJS = useMemo(() => {
    const gameMap = new Map(games.map(g => [g.id, g]));
    let best: { name: string; score: number; game: string } | null = null;
    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game || game.gender !== 'boys' || game.school_level !== 'junior_secondary') continue;
      if (p.score && (!best || p.score > best.score)) {
        best = { name: `${p.first_name} ${p.last_name}`, score: p.score, game: game.name };
      }
    }
    return best;
  }, [games, participants]);

  const bestGirlJS = useMemo(() => {
    const gameMap = new Map(games.map(g => [g.id, g]));
    let best: { name: string; score: number; game: string } | null = null;
    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game || game.gender !== 'girls' || game.school_level !== 'junior_secondary') continue;
      if (p.score && (!best || p.score > best.score)) {
        best = { name: `${p.first_name} ${p.last_name}`, score: p.score, game: game.name };
      }
    }
    return best;
  }, [games, participants]);

  const getPositionIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-muted-foreground font-medium">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-gradient-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">OVERALL RANKINGS</h1>
          </div>
          <p className="text-white/70 mt-2">Grand total scores across all games — follow results from anywhere</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
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
          <Input
            placeholder="Search location (county, zone, subcounty...)"
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            className="w-64"
          />
        </div>

        {/* Best Performers */}
        {(bestBoyPrimary || bestGirlPrimary || bestBoyJS || bestGirlJS) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {bestBoyPrimary && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">🏆 Best Boy (Primary)</p>
                <p className="font-display text-lg text-foreground">{bestBoyPrimary.name}</p>
                <p className="text-sm text-secondary">{bestBoyPrimary.game} — {bestBoyPrimary.score} pts</p>
              </div>
            )}
            {bestGirlPrimary && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">🏆 Best Girl (Primary)</p>
                <p className="font-display text-lg text-foreground">{bestGirlPrimary.name}</p>
                <p className="text-sm text-secondary">{bestGirlPrimary.game} — {bestGirlPrimary.score} pts</p>
              </div>
            )}
            {bestBoyJS && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">🏆 Best Boy (Jr. Secondary)</p>
                <p className="font-display text-lg text-foreground">{bestBoyJS.name}</p>
                <p className="text-sm text-secondary">{bestBoyJS.game} — {bestBoyJS.score} pts</p>
              </div>
            )}
            {bestGirlJS && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">🏆 Best Girl (Jr. Secondary)</p>
                <p className="font-display text-lg text-foreground">{bestGirlJS.name}</p>
                <p className="text-sm text-secondary">{bestGirlJS.game} — {bestGirlJS.score} pts</p>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
        ) : teamScores.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No scores recorded yet</p></div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Team / School</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Games</TableHead>
                  <TableHead className="text-right">Boys</TableHead>
                  <TableHead className="text-right">Girls</TableHead>
                  <TableHead className="text-right">Primary</TableHead>
                  <TableHead className="text-right">Jr. Sec</TableHead>
                  <TableHead className="text-right font-bold">Grand Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamScores.map((team, index) => (
                  <TableRow key={team.schoolId} className={index < 3 ? 'bg-secondary/5' : ''}>
                    <TableCell className="text-center">{getPositionIcon(index)}</TableCell>
                    <TableCell className="font-bold text-foreground">{team.schoolName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {team.zone}, {team.subcounty}, {team.county}
                    </TableCell>
                    <TableCell className="text-right">{team.gamesPlayed}</TableCell>
                    <TableCell className="text-right">{team.boysScore || '-'}</TableCell>
                    <TableCell className="text-right">{team.girlsScore || '-'}</TableCell>
                    <TableCell className="text-right">{team.primaryScore || '-'}</TableCell>
                    <TableCell className="text-right">{team.juniorSecondaryScore || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-lg text-secondary">{team.totalScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverallRankings;
