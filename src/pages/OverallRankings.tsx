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

  const isLoading = gamesLoading || participantsLoading || schoolsLoading;

  const teamScores = useMemo(() => {
    const scoreMap = new Map<string, TeamScore>();

    // Build a game lookup for gender and school_level
    const gameMap = new Map(games.map(g => [g.id, g]));

    for (const p of participants) {
      const game = gameMap.get(p.game_id);
      if (!game) continue;

      // Apply filters
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
          totalScore: 0,
          gamesPlayed: 0,
          boysScore: 0,
          girlsScore: 0,
          primaryScore: 0,
          juniorSecondaryScore: 0,
        });
      }
      const entry = scoreMap.get(p.school_id)!;
      entry.totalScore += score;
      if (game.gender === 'boys') entry.boysScore += score;
      else entry.girlsScore += score;
      if (game.school_level === 'primary') entry.primaryScore += score;
      else entry.juniorSecondaryScore += score;
    }

    // Count unique games per school
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

    return Array.from(scoreMap.values()).sort((a, b) => b.totalScore - a.totalScore);
  }, [games, participants, schools, levelFilter, genderFilter, schoolLevelFilter]);

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
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">
              OVERALL RANKINGS
            </h1>
          </div>
          <p className="text-white/70 mt-2">
            Grand total scores across all games for each team/school
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : teamScores.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No scores recorded yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Team / School</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Games</TableHead>
                  <TableHead className="text-right">Boys Score</TableHead>
                  <TableHead className="text-right">Girls Score</TableHead>
                  <TableHead className="text-right">Primary</TableHead>
                  <TableHead className="text-right">Jr. Secondary</TableHead>
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
                    <TableCell className="text-right font-bold text-lg text-secondary">
                      {team.totalScore}
                    </TableCell>
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
