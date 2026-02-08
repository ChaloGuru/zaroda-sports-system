import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGames';
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool } from '@/hooks/useSchools';
import { useParticipants, useCreateParticipant, useUpdateParticipant, useDeleteParticipant, useBulkUpdateQualified, useRankByTime } from '@/hooks/useParticipants';
import { useChampionships, useCreateChampionship, useDeleteChampionship } from '@/hooks/useChampionships';
import { useCirculars, useCreateCircular, useDeleteCircular } from '@/hooks/useCirculars';
import { useHeats, useCreateHeat, useDeleteHeat, useAllHeatParticipants, useAddHeatParticipant, useUpdateHeatParticipant, useDeleteHeatParticipant } from '@/hooks/useHeats';
import { useMatchPools, useCreateMatchPool, useUpdateMatchPool, useDeleteMatchPool } from '@/hooks/useMatchPools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { 
  Game, School, Participant, GameCategory, CompetitionLevel, Gender, SchoolLevel,
  CATEGORY_LABELS, LEVEL_LABELS, GENDER_LABELS, SCHOOL_LEVEL_LABELS
} from '@/types/database';
import { 
  Plus, Pencil, Trash2, LogOut, Home, Trophy, Users, 
  MapPin, Target, Clock, CheckCircle2, Loader2, Timer, BarChart3,
  FileText, Award, Swords
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, logout } = useAdmin();
  
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: participants = [], isLoading: participantsLoading } = useParticipants();
  const { data: championships = [] } = useChampionships();
  const { data: circulars = [] } = useCirculars();
  
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant();
  const bulkUpdateQualified = useBulkUpdateQualified();
  const rankByTime = useRankByTime();
  const createChampionship = useCreateChampionship();
  const deleteChampionship = useDeleteChampionship();
  const createCircular = useCreateCircular();
  const deleteCircular = useDeleteCircular();
  const createHeat = useCreateHeat();
  const deleteHeat = useDeleteHeat();
  const addHeatParticipant = useAddHeatParticipant();
  const updateHeatParticipant = useUpdateHeatParticipant();
  const deleteHeatParticipant = useDeleteHeatParticipant();
  const createMatchPool = useCreateMatchPool();
  const updateMatchPool = useUpdateMatchPool();
  const deleteMatchPool = useDeleteMatchPool();

  // Dialogs
  const [gameDialog, setGameDialog] = useState(false);
  const [schoolDialog, setSchoolDialog] = useState(false);
  const [participantDialog, setParticipantDialog] = useState(false);
  const [qualifyDialog, setQualifyDialog] = useState(false);
  const [championshipDialog, setChampionshipDialog] = useState(false);
  const [circularDialog, setCircularDialog] = useState(false);
  const [heatDialog, setHeatDialog] = useState(false);
  const [heatParticipantDialog, setHeatParticipantDialog] = useState(false);
  const [matchDialog, setMatchDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: string; id: string } | null>(null);
  
  // Editing state
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [selectedGameForQualify, setSelectedGameForQualify] = useState<Game | null>(null);
  const [selectedQualifiers, setSelectedQualifiers] = useState<string[]>([]);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<GameCategory | 'all'>('all');
  const [filterGame, setFilterGame] = useState<string>('all');
  const [heatGameId, setHeatGameId] = useState<string>('');
  const [matchGameId, setMatchGameId] = useState<string>('');

  // Form state
  const [gameFormGender, setGameFormGender] = useState<Gender>('boys');
  const [gameFormSchoolLevel, setGameFormSchoolLevel] = useState<SchoolLevel>('primary');
  const [gameFormCategory, setGameFormCategory] = useState<GameCategory>('ball_games');
  const [gameFormLevel, setGameFormLevel] = useState<CompetitionLevel>('zone');
  const [gameFormRaceType, setGameFormRaceType] = useState<string>('');
  const [participantFormGender, setParticipantFormGender] = useState<Gender>('boys');
  const [participantFormSchoolId, setParticipantFormSchoolId] = useState<string>('');
  const [participantFormGameId, setParticipantFormGameId] = useState<string>('');
  
  // Championship form
  const [champLevel, setChampLevel] = useState<CompetitionLevel>('zone');
  
  // Circular form
  const [circularLevel, setCircularLevel] = useState<CompetitionLevel>('national');
  
  // Heat form
  const [heatFormGameId, setHeatFormGameId] = useState<string>('');
  const [heatFormType, setHeatFormType] = useState<string>('heat');
  
  // Heat participant form
  const [hpHeatId, setHpHeatId] = useState<string>('');
  const [hpParticipantId, setHpParticipantId] = useState<string>('');
  
  // Match form
  const [matchFormGameId, setMatchFormGameId] = useState<string>('');
  const [matchTeamA, setMatchTeamA] = useState<string>('');
  const [matchTeamB, setMatchTeamB] = useState<string>('');
  const [editingMatchId, setEditingMatchId] = useState<string>('');

  // Heats data
  const { data: heatsForGame = [] } = useHeats(heatGameId || undefined);
  const { data: allHeatParticipants = [] } = useAllHeatParticipants(heatGameId || undefined);
  
  // Match pools data
  const { data: matchPoolsForGame = [] } = useMatchPools(matchGameId || undefined);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/login');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (editingGame) {
      setGameFormGender(editingGame.gender);
      setGameFormSchoolLevel(editingGame.school_level);
      setGameFormCategory(editingGame.category);
      setGameFormLevel(editingGame.level);
      setGameFormRaceType(editingGame.race_type || '');
    } else {
      setGameFormGender('boys');
      setGameFormSchoolLevel('primary');
      setGameFormCategory('ball_games');
      setGameFormLevel('zone');
      setGameFormRaceType('');
    }
  }, [editingGame]);

  useEffect(() => {
    if (editingParticipant) {
      setParticipantFormGender(editingParticipant.gender);
      setParticipantFormSchoolId(editingParticipant.school_id);
      setParticipantFormGameId(editingParticipant.game_id);
    } else {
      setParticipantFormGender('boys');
      setParticipantFormSchoolId('');
      setParticipantFormGameId('');
    }
  }, [editingParticipant]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSaveGame = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      category: gameFormCategory,
      level: gameFormLevel,
      gender: gameFormGender,
      school_level: gameFormSchoolLevel,
      description: formData.get('description') as string || undefined,
      is_timed: formData.get('is_timed') === 'true',
      max_qualifiers: parseInt(formData.get('max_qualifiers') as string) || 5,
      race_type: gameFormRaceType || null,
    };
    try {
      if (editingGame) {
        await updateGame.mutateAsync({ id: editingGame.id, ...data });
        toast.success('Game updated');
      } else {
        await createGame.mutateAsync(data as any);
        toast.success('Game created');
      }
      setGameDialog(false);
      setEditingGame(null);
    } catch { toast.error('Failed to save game'); }
  };

  const handleSaveSchool = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      zone: formData.get('zone') as string,
      subcounty: formData.get('subcounty') as string,
      county: formData.get('county') as string,
      region: formData.get('region') as string,
      country: formData.get('country') as string || 'Kenya',
    };
    try {
      if (editingSchool) {
        await updateSchool.mutateAsync({ id: editingSchool.id, ...data });
        toast.success('School updated');
      } else {
        await createSchool.mutateAsync(data);
        toast.success('School created');
      }
      setSchoolDialog(false);
      setEditingSchool(null);
    } catch { toast.error('Failed to save school'); }
  };

  const handleSaveParticipant = async (formData: FormData) => {
    const data = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      school_id: participantFormSchoolId,
      game_id: participantFormGameId,
      gender: participantFormGender,
      time_taken: formData.get('time_taken') ? parseFloat(formData.get('time_taken') as string) : undefined,
      position: formData.get('position') ? parseInt(formData.get('position') as string) : undefined,
      score: formData.get('score') ? parseFloat(formData.get('score') as string) : undefined,
      is_qualified: formData.get('is_qualified') === 'true',
      notes: formData.get('notes') as string || undefined,
    };
    try {
      if (editingParticipant) {
        await updateParticipant.mutateAsync({ id: editingParticipant.id, ...data });
        toast.success('Participant updated');
      } else {
        await createParticipant.mutateAsync(data);
        toast.success('Participant added');
      }
      setParticipantDialog(false);
      setEditingParticipant(null);
    } catch { toast.error('Failed to save participant'); }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      const { type, id } = deleteDialog;
      if (type === 'game') await deleteGame.mutateAsync(id);
      else if (type === 'school') await deleteSchool.mutateAsync(id);
      else if (type === 'participant') await deleteParticipant.mutateAsync(id);
      else if (type === 'championship') await deleteChampionship.mutateAsync(id);
      else if (type === 'circular') await deleteCircular.mutateAsync(id);
      else if (type === 'heat') await deleteHeat.mutateAsync(id);
      else if (type === 'heat_participant') await deleteHeatParticipant.mutateAsync(id);
      else if (type === 'match') await deleteMatchPool.mutateAsync(id);
      toast.success('Deleted successfully');
    } catch { toast.error('Failed to delete'); }
    setDeleteDialog(null);
  };

  const handleOpenQualifyDialog = (game: Game) => {
    setSelectedGameForQualify(game);
    const gameParticipants = participants.filter(p => p.game_id === game.id);
    setSelectedQualifiers(gameParticipants.filter(p => p.is_qualified).map(p => p.id));
    setQualifyDialog(true);
  };

  const handleSaveQualifiers = async () => {
    if (!selectedGameForQualify) return;
    try {
      await bulkUpdateQualified.mutateAsync({ gameId: selectedGameForQualify.id, qualifiedIds: selectedQualifiers });
      toast.success('Qualifiers updated');
      setQualifyDialog(false);
    } catch { toast.error('Failed to update qualifiers'); }
  };

  const handleSaveChampionship = async (formData: FormData) => {
    try {
      await createChampionship.mutateAsync({
        name: formData.get('name') as string,
        level: champLevel,
        location: formData.get('location') as string || undefined,
        start_date: formData.get('start_date') as string || undefined,
        end_date: formData.get('end_date') as string || undefined,
        description: formData.get('description') as string || undefined,
      });
      toast.success('Championship created');
      setChampionshipDialog(false);
    } catch { toast.error('Failed to create championship'); }
  };

  const handleSaveCircular = async (formData: FormData) => {
    try {
      await createCircular.mutateAsync({
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        sender_name: formData.get('sender_name') as string,
        sender_role: formData.get('sender_role') as string || 'National Admin',
        target_level: circularLevel,
        is_published: true,
      });
      toast.success('Circular published');
      setCircularDialog(false);
    } catch { toast.error('Failed to publish circular'); }
  };

  const handleCreateHeat = async (formData: FormData) => {
    try {
      await createHeat.mutateAsync({
        game_id: heatFormGameId,
        heat_number: parseInt(formData.get('heat_number') as string) || 1,
        heat_type: heatFormType,
      });
      toast.success('Heat created');
      setHeatDialog(false);
    } catch { toast.error('Failed to create heat'); }
  };

  const handleAddHeatParticipant = async (formData: FormData) => {
    try {
      await addHeatParticipant.mutateAsync({
        heat_id: hpHeatId,
        participant_id: hpParticipantId,
        time_taken: formData.get('time_taken') ? parseFloat(formData.get('time_taken') as string) : undefined,
        position: formData.get('position') ? parseInt(formData.get('position') as string) : undefined,
        is_qualified_for_final: formData.get('is_qualified_for_final') === 'true',
      });
      toast.success('Added to heat');
      setHeatParticipantDialog(false);
    } catch { toast.error('Failed to add to heat'); }
  };

  const handleCreateMatch = async (formData: FormData) => {
    try {
      if (editingMatchId) {
        await updateMatchPool.mutateAsync({
          id: editingMatchId,
          team_a_score: formData.get('team_a_score') ? parseInt(formData.get('team_a_score') as string) : undefined,
          team_b_score: formData.get('team_b_score') ? parseInt(formData.get('team_b_score') as string) : undefined,
          winner_school_id: formData.get('winner') as string || undefined,
          notes: formData.get('notes') as string || undefined,
        });
        toast.success('Match updated');
      } else {
        await createMatchPool.mutateAsync({
          game_id: matchFormGameId,
          round_name: formData.get('round_name') as string || 'Round 1',
          team_a_school_id: matchTeamA || undefined,
          team_b_school_id: matchTeamB || undefined,
        });
        toast.success('Match created');
      }
      setMatchDialog(false);
      setEditingMatchId('');
    } catch { toast.error('Failed to save match'); }
  };

  const filteredGames = filterCategory === 'all' ? games : games.filter(g => g.category === filterCategory);
  const filteredParticipants = filterGame === 'all' ? participants : participants.filter(p => p.game_id === filterGame);
  const athleticsGames = games.filter(g => g.category === 'athletics');
  const ballGames = games.filter(g => g.category === 'ball_games');

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>;
  if (!isAdmin) return null;

  const isLoading = gamesLoading || schoolsLoading || participantsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-display text-xl">Z</span>
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-wider">ADMIN DASHBOARD</h1>
                <p className="text-primary-foreground/70 text-sm">Zaroda Sports Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-1" />View Site
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/rankings')}>
                <BarChart3 className="w-4 h-4 mr-1" />Rankings
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center"><Target className="w-5 h-5 text-secondary" /></div>
              <div><p className="text-muted-foreground text-sm">Games</p><p className="text-2xl font-display">{games.length}</p></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-secondary" /></div>
              <div><p className="text-muted-foreground text-sm">Participants</p><p className="text-2xl font-display">{participants.length}</p></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-secondary" /></div>
              <div><p className="text-muted-foreground text-sm">Schools</p><p className="text-2xl font-display">{schools.length}</p></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center"><Trophy className="w-5 h-5 text-secondary" /></div>
              <div><p className="text-muted-foreground text-sm">Qualified</p><p className="text-2xl font-display">{participants.filter(p => p.is_qualified).length}</p></div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
        ) : (
          <Tabs defaultValue="games" className="space-y-4">
            <TabsList className="bg-muted flex-wrap h-auto gap-1">
              <TabsTrigger value="games" className="gap-1"><Target className="w-4 h-4" />Games</TabsTrigger>
              <TabsTrigger value="participants" className="gap-1"><Users className="w-4 h-4" />Participants</TabsTrigger>
              <TabsTrigger value="schools" className="gap-1"><MapPin className="w-4 h-4" />Schools</TabsTrigger>
              <TabsTrigger value="heats" className="gap-1"><Timer className="w-4 h-4" />Heats</TabsTrigger>
              <TabsTrigger value="pooling" className="gap-1"><Swords className="w-4 h-4" />Pooling</TabsTrigger>
              <TabsTrigger value="championships" className="gap-1"><Award className="w-4 h-4" />Championships</TabsTrigger>
              <TabsTrigger value="circulars" className="gap-1"><FileText className="w-4 h-4" />Circulars</TabsTrigger>
            </TabsList>

            {/* ===== GAMES TAB ===== */}
            <TabsContent value="games" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as GameCategory | 'all')}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ball_games">Ball Games</SelectItem>
                    <SelectItem value="athletics">Athletics</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => { setEditingGame(null); setGameDialog(true); }}><Plus className="w-4 h-4 mr-1" />Add Game</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>School Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGames.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No games found</TableCell></TableRow>
                    ) : filteredGames.map(game => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell><Badge variant="outline">{CATEGORY_LABELS[game.category]}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{LEVEL_LABELS[game.level]}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={game.gender === 'boys' ? 'border-blue-400 text-blue-600' : 'border-pink-400 text-pink-600'}>{GENDER_LABELS[game.gender]}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{SCHOOL_LEVEL_LABELS[game.school_level]}</Badge></TableCell>
                        <TableCell>{game.is_timed ? <span className="flex items-center gap-1 text-sm"><Clock className="w-3 h-3" />Timed</span> : game.race_type || 'Standard'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {game.is_timed && <Button variant="outline" size="sm" onClick={() => rankByTime.mutateAsync(game.id).then(() => toast.success('Ranked'))}><Timer className="w-3 h-3 mr-1" />Rank</Button>}
                            <Button variant="outline" size="sm" onClick={() => handleOpenQualifyDialog(game)}><CheckCircle2 className="w-3 h-3 mr-1" />Qualify</Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingGame(game); setGameDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'game', id: game.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ===== PARTICIPANTS TAB ===== */}
            <TabsContent value="participants" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={filterGame} onValueChange={setFilterGame}>
                  <SelectTrigger className="w-60"><SelectValue placeholder="Filter by game" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {games.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({GENDER_LABELS[g.gender]} - {SCHOOL_LEVEL_LABELS[g.school_level]})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => { setEditingParticipant(null); setParticipantDialog(true); }}><Plus className="w-4 h-4 mr-1" />Add Participant</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead><TableHead>Gender</TableHead><TableHead>School</TableHead>
                      <TableHead>Game</TableHead><TableHead>Pos</TableHead><TableHead>Score</TableHead>
                      <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No participants</TableCell></TableRow>
                    ) : filteredParticipants.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                        <TableCell><Badge variant="outline" className={p.gender === 'boys' ? 'border-blue-400 text-blue-600' : 'border-pink-400 text-pink-600'}>{GENDER_LABELS[p.gender]}</Badge></TableCell>
                        <TableCell>{p.school?.name || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{p.game?.name}</Badge></TableCell>
                        <TableCell>{p.position || '-'}</TableCell>
                        <TableCell>{p.score ?? '-'}</TableCell>
                        <TableCell>{p.is_qualified ? <Badge className="bg-success text-success-foreground">Qualified</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingParticipant(p); setParticipantDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'participant', id: p.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ===== SCHOOLS TAB ===== */}
            <TabsContent value="schools" className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => { setEditingSchool(null); setSchoolDialog(true); }}><Plus className="w-4 h-4 mr-1" />Add School</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead><TableHead>Zone</TableHead><TableHead>Sub-County</TableHead>
                      <TableHead>County</TableHead><TableHead>Region</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No schools</TableCell></TableRow>
                    ) : schools.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.zone}</TableCell><TableCell>{s.subcounty}</TableCell>
                        <TableCell>{s.county}</TableCell><TableCell>{s.region}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingSchool(s); setSchoolDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'school', id: s.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ===== HEATS TAB ===== */}
            <TabsContent value="heats" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={heatGameId} onValueChange={setHeatGameId}>
                  <SelectTrigger className="w-60"><SelectValue placeholder="Select athletics game" /></SelectTrigger>
                  <SelectContent>
                    {athleticsGames.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({GENDER_LABELS[g.gender]})</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={() => { setHeatFormGameId(heatGameId); setHeatDialog(true); }} disabled={!heatGameId}><Plus className="w-4 h-4 mr-1" />Add Heat</Button>
                  <Button variant="outline" onClick={() => { setHpHeatId(''); setHeatParticipantDialog(true); }} disabled={!heatGameId}><Plus className="w-4 h-4 mr-1" />Add to Heat</Button>
                </div>
              </div>
              {heatsForGame.length > 0 ? (
                <div className="space-y-4">
                  {heatsForGame.map(heat => {
                    const hps = allHeatParticipants.filter(hp => hp.heat_id === heat.id).sort((a, b) => (a.position || 999) - (b.position || 999));
                    return (
                      <div key={heat.id} className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                          <h3 className="font-display text-lg">{heat.heat_type === 'final' ? '🏆 FINAL' : `Heat ${heat.heat_number}`}</h3>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'heat', id: heat.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>Pos</TableHead><TableHead>Name</TableHead><TableHead>School</TableHead><TableHead>Time</TableHead><TableHead>Finals?</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {hps.length === 0 ? (
                              <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Empty heat</TableCell></TableRow>
                            ) : hps.map(hp => (
                              <TableRow key={hp.id}>
                                <TableCell>{hp.position || '-'}</TableCell>
                                <TableCell className="font-medium">{hp.participant?.first_name} {hp.participant?.last_name}</TableCell>
                                <TableCell>{hp.participant?.school?.name || '-'}</TableCell>
                                <TableCell>{hp.time_taken ? `${hp.time_taken}s` : '-'}</TableCell>
                                <TableCell>{hp.is_qualified_for_final ? <Badge className="bg-success text-success-foreground">Yes</Badge> : '-'}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'heat_participant', id: hp.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{heatGameId ? 'No heats yet. Create one!' : 'Select an athletics game to manage heats'}</div>
              )}
            </TabsContent>

            {/* ===== POOLING TAB ===== */}
            <TabsContent value="pooling" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={matchGameId} onValueChange={setMatchGameId}>
                  <SelectTrigger className="w-60"><SelectValue placeholder="Select ball game" /></SelectTrigger>
                  <SelectContent>
                    {ballGames.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({GENDER_LABELS[g.gender]})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => { setMatchFormGameId(matchGameId); setEditingMatchId(''); setMatchDialog(true); }} disabled={!matchGameId}><Plus className="w-4 h-4 mr-1" />Add Match</Button>
              </div>
              {matchPoolsForGame.length > 0 ? (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Round</TableHead><TableHead>Team A</TableHead><TableHead>Score</TableHead>
                        <TableHead>Team B</TableHead><TableHead>Score</TableHead><TableHead>Winner</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchPoolsForGame.map(m => (
                        <TableRow key={m.id}>
                          <TableCell><Badge variant="outline">{m.round_name}</Badge></TableCell>
                          <TableCell className="font-medium">{m.team_a_school?.name || '-'}</TableCell>
                          <TableCell className="font-bold">{m.team_a_score ?? '-'}</TableCell>
                          <TableCell className="font-medium">{m.team_b_school?.name || '-'}</TableCell>
                          <TableCell className="font-bold">{m.team_b_score ?? '-'}</TableCell>
                          <TableCell>{m.winner_school?.name || 'TBD'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingMatchId(m.id); setMatchFormGameId(m.game_id); setMatchDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'match', id: m.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{matchGameId ? 'No matches yet. Create one!' : 'Select a ball game to manage pooling'}</div>
              )}
            </TabsContent>

            {/* ===== CHAMPIONSHIPS TAB ===== */}
            <TabsContent value="championships" className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => setChampionshipDialog(true)}><Plus className="w-4 h-4 mr-1" />Create Championship</Button>
              </div>
              {championships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No championships created yet</div>
              ) : (
                <div className="space-y-4">
                  {championships.map(c => (
                    <div key={c.id} className="bg-card border border-border rounded-xl p-6 flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-xl text-foreground">{c.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{LEVEL_LABELS[c.level]}</Badge>
                          {c.location && <Badge variant="outline">{c.location}</Badge>}
                        </div>
                        {c.start_date && <p className="text-sm text-muted-foreground mt-2">{c.start_date} — {c.end_date || 'TBD'}</p>}
                        {c.description && <p className="text-sm mt-2">{c.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'championship', id: c.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ===== CIRCULARS TAB ===== */}
            <TabsContent value="circulars" className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => setCircularDialog(true)}><Plus className="w-4 h-4 mr-1" />Publish Circular</Button>
              </div>
              {circulars.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No circulars published yet</div>
              ) : (
                <div className="space-y-4">
                  {circulars.map(c => (
                    <div key={c.id} className="bg-card border border-border rounded-xl p-6 flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-xl text-foreground">{c.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">By {c.sender_name} ({c.sender_role}) • {LEVEL_LABELS[c.target_level]}</p>
                        <p className="text-sm mt-2 line-clamp-3">{c.content}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'circular', id: c.id })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* ===== DIALOGS ===== */}

      {/* Game Dialog */}
      <Dialog open={gameDialog} onOpenChange={setGameDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveGame(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="name">Game Name</Label><Input id="name" name="name" defaultValue={editingGame?.name} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={gameFormCategory} onValueChange={(v) => setGameFormCategory(v as GameCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ball_games">Ball Games</SelectItem><SelectItem value="athletics">Athletics</SelectItem><SelectItem value="music">Music</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Level</Label>
                  <Select value={gameFormLevel} onValueChange={(v) => setGameFormLevel(v as CompetitionLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="zone">Zone</SelectItem><SelectItem value="subcounty">Sub-County</SelectItem><SelectItem value="county">County</SelectItem><SelectItem value="region">Region</SelectItem><SelectItem value="national">National</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Gender</Label>
                  <Select value={gameFormGender} onValueChange={(v) => setGameFormGender(v as Gender)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="boys">Boys</SelectItem><SelectItem value="girls">Girls</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>School Level</Label>
                  <Select value={gameFormSchoolLevel} onValueChange={(v) => setGameFormSchoolLevel(v as SchoolLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="junior_secondary">Junior Secondary</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              {gameFormCategory === 'athletics' && (
                <div className="space-y-2"><Label>Race Type</Label>
                  <Select value={gameFormRaceType} onValueChange={setGameFormRaceType}>
                    <SelectTrigger><SelectValue placeholder="Select race type" /></SelectTrigger>
                    <SelectContent><SelectItem value="short_race">Short Race</SelectItem><SelectItem value="long_race">Long Race</SelectItem></SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={editingGame?.description || ''} /></div>
              <div className="flex items-center gap-2">
                <Switch id="is_timed" defaultChecked={editingGame?.is_timed} onCheckedChange={(checked) => {
                  const input = document.querySelector('input[name="is_timed"]') as HTMLInputElement;
                  if (input) input.value = checked ? 'true' : 'false';
                }} />
                <input type="hidden" name="is_timed" defaultValue={editingGame?.is_timed ? 'true' : 'false'} />
                <Label htmlFor="is_timed">Timed Event</Label>
              </div>
              <div className="space-y-2"><Label htmlFor="max_qualifiers">Max Qualifiers</Label><Input id="max_qualifiers" name="max_qualifiers" type="number" min="1" defaultValue={editingGame?.max_qualifiers || 5} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setGameDialog(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* School Dialog */}
      <Dialog open={schoolDialog} onOpenChange={setSchoolDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSchool(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="school_name">School Name</Label><Input id="school_name" name="name" defaultValue={editingSchool?.name} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="zone">Zone</Label><Input id="zone" name="zone" defaultValue={editingSchool?.zone} required /></div>
                <div className="space-y-2"><Label htmlFor="subcounty">Sub-County</Label><Input id="subcounty" name="subcounty" defaultValue={editingSchool?.subcounty} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="county">County</Label><Input id="county" name="county" defaultValue={editingSchool?.county} required /></div>
                <div className="space-y-2"><Label htmlFor="region">Region</Label><Input id="region" name="region" defaultValue={editingSchool?.region} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" name="country" defaultValue={editingSchool?.country || 'Kenya'} required /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSchoolDialog(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Participant Dialog */}
      <Dialog open={participantDialog} onOpenChange={setParticipantDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingParticipant ? 'Edit Participant' : 'Add New Participant'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveParticipant(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" defaultValue={editingParticipant?.first_name} required /></div>
                <div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" defaultValue={editingParticipant?.last_name} required /></div>
              </div>
              <div className="space-y-2"><Label>Gender</Label>
                <Select value={participantFormGender} onValueChange={(v) => setParticipantFormGender(v as Gender)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="boys">Boy</SelectItem><SelectItem value="girls">Girl</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>School</Label>
                <Select value={participantFormSchoolId} onValueChange={setParticipantFormSchoolId}>
                  <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                  <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Game</Label>
                <Select value={participantFormGameId} onValueChange={setParticipantFormGameId}>
                  <SelectTrigger><SelectValue placeholder="Select game" /></SelectTrigger>
                  <SelectContent>{games.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({GENDER_LABELS[g.gender]} - {SCHOOL_LEVEL_LABELS[g.school_level]})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="position">Position</Label><Input id="position" name="position" type="number" min="1" defaultValue={editingParticipant?.position || ''} /></div>
                <div className="space-y-2"><Label htmlFor="time_taken">Time (s)</Label><Input id="time_taken" name="time_taken" type="number" step="0.001" defaultValue={editingParticipant?.time_taken || ''} /></div>
                <div className="space-y-2"><Label htmlFor="score">Score</Label><Input id="score" name="score" type="number" step="0.01" defaultValue={editingParticipant?.score || ''} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is_qualified" defaultChecked={editingParticipant?.is_qualified} onCheckedChange={(checked) => {
                  const input = document.querySelector('input[name="is_qualified"]') as HTMLInputElement;
                  if (input) input.value = checked ? 'true' : 'false';
                }} />
                <input type="hidden" name="is_qualified" defaultValue={editingParticipant?.is_qualified ? 'true' : 'false'} />
                <Label htmlFor="is_qualified">Qualified for next level</Label>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" defaultValue={editingParticipant?.notes || ''} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setParticipantDialog(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Championship Dialog */}
      <Dialog open={championshipDialog} onOpenChange={setChampionshipDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Championship</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveChampionship(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="champ_name">Championship Name</Label><Input id="champ_name" name="name" placeholder="e.g. Meru County 2026 Athletics Championship" required /></div>
              <div className="space-y-2"><Label>Level</Label>
                <Select value={champLevel} onValueChange={(v) => setChampLevel(v as CompetitionLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="zone">Zone</SelectItem><SelectItem value="subcounty">Sub-County</SelectItem><SelectItem value="county">County</SelectItem><SelectItem value="region">Region</SelectItem><SelectItem value="national">National</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="location">Location/Venue</Label><Input id="location" name="location" placeholder="e.g. Meru High School" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="start_date">Start Date</Label><Input id="start_date" name="start_date" type="date" /></div>
                <div className="space-y-2"><Label htmlFor="end_date">End Date</Label><Input id="end_date" name="end_date" type="date" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="champ_desc">Description</Label><Textarea id="champ_desc" name="description" /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setChampionshipDialog(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Circular Dialog */}
      <Dialog open={circularDialog} onOpenChange={setCircularDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish Circular</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCircular(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="circ_title">Title</Label><Input id="circ_title" name="title" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="sender_name">Sender Name</Label><Input id="sender_name" name="sender_name" required /></div>
                <div className="space-y-2"><Label htmlFor="sender_role">Sender Role</Label><Input id="sender_role" name="sender_role" defaultValue="National Admin" /></div>
              </div>
              <div className="space-y-2"><Label>Target Level</Label>
                <Select value={circularLevel} onValueChange={(v) => setCircularLevel(v as CompetitionLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="zone">Zone</SelectItem><SelectItem value="subcounty">Sub-County</SelectItem><SelectItem value="county">County</SelectItem><SelectItem value="region">Region</SelectItem><SelectItem value="national">National</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="circ_content">Content</Label><Textarea id="circ_content" name="content" rows={6} required /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCircularDialog(false)}>Cancel</Button><Button type="submit">Publish</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Heat Dialog */}
      <Dialog open={heatDialog} onOpenChange={setHeatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Heat</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateHeat(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Type</Label>
                <Select value={heatFormType} onValueChange={setHeatFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="heat">Heat</SelectItem><SelectItem value="final">Final</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="heat_number">Heat Number</Label><Input id="heat_number" name="heat_number" type="number" min="1" defaultValue="1" /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setHeatDialog(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Heat Participant Dialog */}
      <Dialog open={heatParticipantDialog} onOpenChange={setHeatParticipantDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Participant to Heat</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddHeatParticipant(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Heat</Label>
                <Select value={hpHeatId} onValueChange={setHpHeatId}>
                  <SelectTrigger><SelectValue placeholder="Select heat" /></SelectTrigger>
                  <SelectContent>{heatsForGame.map(h => <SelectItem key={h.id} value={h.id}>{h.heat_type === 'final' ? 'Final' : `Heat ${h.heat_number}`}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Participant</Label>
                <Select value={hpParticipantId} onValueChange={setHpParticipantId}>
                  <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                  <SelectContent>{participants.filter(p => p.game_id === heatGameId).map(p => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.school?.name})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="hp_time">Time (s)</Label><Input id="hp_time" name="time_taken" type="number" step="0.001" /></div>
                <div className="space-y-2"><Label htmlFor="hp_pos">Position</Label><Input id="hp_pos" name="position" type="number" min="1" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="hp_qualified" onCheckedChange={(checked) => {
                  const input = document.querySelector('input[name="is_qualified_for_final"]') as HTMLInputElement;
                  if (input) input.value = checked ? 'true' : 'false';
                }} />
                <input type="hidden" name="is_qualified_for_final" defaultValue="false" />
                <Label htmlFor="hp_qualified">Qualified for Final</Label>
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setHeatParticipantDialog(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Match Dialog */}
      <Dialog open={matchDialog} onOpenChange={setMatchDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingMatchId ? 'Update Match Scores' : 'Create Match'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateMatch(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              {!editingMatchId && (
                <>
                  <div className="space-y-2"><Label htmlFor="round_name">Round Name</Label><Input id="round_name" name="round_name" defaultValue="Round 1" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Team A</Label>
                      <Select value={matchTeamA} onValueChange={setMatchTeamA}>
                        <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                        <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Team B</Label>
                      <Select value={matchTeamB} onValueChange={setMatchTeamB}>
                        <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                        <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              {editingMatchId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="team_a_score">Team A Score</Label><Input id="team_a_score" name="team_a_score" type="number" /></div>
                    <div className="space-y-2"><Label htmlFor="team_b_score">Team B Score</Label><Input id="team_b_score" name="team_b_score" type="number" /></div>
                  </div>
                  <div className="space-y-2"><Label>Winner</Label>
                    <Select name="winner" defaultValue="">
                      <SelectTrigger><SelectValue placeholder="Select winner" /></SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const match = matchPoolsForGame.find(m => m.id === editingMatchId);
                          return [
                            match?.team_a_school_id && <SelectItem key="a" value={match.team_a_school_id}>{match.team_a_school?.name}</SelectItem>,
                            match?.team_b_school_id && <SelectItem key="b" value={match.team_b_school_id}>{match.team_b_school?.name}</SelectItem>,
                          ];
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="match_notes">Notes</Label><Textarea id="match_notes" name="notes" /></div>
                </>
              )}
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => { setMatchDialog(false); setEditingMatchId(''); }}>Cancel</Button><Button type="submit">{editingMatchId ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Qualify Dialog */}
      <Dialog open={qualifyDialog} onOpenChange={setQualifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Select Qualifiers - {selectedGameForQualify?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">Select up to {selectedGameForQualify?.max_qualifiers} participants. Selected: {selectedQualifiers.length}/{selectedGameForQualify?.max_qualifiers}</p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {participants.filter(p => p.game_id === selectedGameForQualify?.id).sort((a, b) => (a.position || 999) - (b.position || 999)).map(p => (
                <div key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedQualifiers.includes(p.id) ? 'bg-success/10 border-success' : 'bg-card border-border hover:border-secondary'}`}
                  onClick={() => {
                    if (selectedQualifiers.includes(p.id)) setSelectedQualifiers(prev => prev.filter(id => id !== p.id));
                    else if (selectedQualifiers.length < (selectedGameForQualify?.max_qualifiers || 5)) setSelectedQualifiers(prev => [...prev, p.id]);
                  }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedQualifiers.includes(p.id) ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                      {selectedQualifiers.includes(p.id) ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{p.position || '-'}</span>}
                    </div>
                    <div>
                      <p className="font-medium">{p.first_name} {p.last_name}</p>
                      <p className="text-sm text-muted-foreground">{p.school?.name} • {GENDER_LABELS[p.gender]}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {p.time_taken && <span>{p.time_taken}s</span>}
                    {p.score != null && <span> Score: {p.score}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setQualifyDialog(false)}>Cancel</Button><Button onClick={handleSaveQualifiers}>Save Qualifiers</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
