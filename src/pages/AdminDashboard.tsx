import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGames';
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool } from '@/hooks/useSchools';
import { useParticipants, useCreateParticipant, useUpdateParticipant, useDeleteParticipant, useBulkUpdateQualified, useRankByTime } from '@/hooks/useParticipants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { 
  Game, School, Participant, GameCategory, CompetitionLevel,
  CATEGORY_LABELS, LEVEL_LABELS 
} from '@/types/database';
import { 
  Plus, Pencil, Trash2, LogOut, Home, Trophy, Users, 
  MapPin, Target, Clock, CheckCircle2, Loader2, Timer
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, logout } = useAdmin();
  
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: participants = [], isLoading: participantsLoading } = useParticipants();
  
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

  // State for dialogs
  const [gameDialog, setGameDialog] = useState(false);
  const [schoolDialog, setSchoolDialog] = useState(false);
  const [participantDialog, setParticipantDialog] = useState(false);
  const [qualifyDialog, setQualifyDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'game' | 'school' | 'participant'; id: string } | null>(null);
  
  // State for form data
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [selectedGameForQualify, setSelectedGameForQualify] = useState<Game | null>(null);
  const [selectedQualifiers, setSelectedQualifiers] = useState<string[]>([]);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<GameCategory | 'all'>('all');
  const [filterGame, setFilterGame] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Game CRUD
  const handleSaveGame = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as GameCategory,
      level: formData.get('level') as CompetitionLevel,
      description: formData.get('description') as string || undefined,
      is_timed: formData.get('is_timed') === 'true',
      max_qualifiers: parseInt(formData.get('max_qualifiers') as string) || 5,
    };

    try {
      if (editingGame) {
        await updateGame.mutateAsync({ id: editingGame.id, ...data });
        toast.success('Game updated successfully');
      } else {
        await createGame.mutateAsync(data);
        toast.success('Game created successfully');
      }
      setGameDialog(false);
      setEditingGame(null);
    } catch (error) {
      toast.error('Failed to save game');
    }
  };

  // School CRUD
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
        toast.success('School updated successfully');
      } else {
        await createSchool.mutateAsync(data);
        toast.success('School created successfully');
      }
      setSchoolDialog(false);
      setEditingSchool(null);
    } catch (error) {
      toast.error('Failed to save school');
    }
  };

  // Participant CRUD
  const handleSaveParticipant = async (formData: FormData) => {
    const data = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      school_id: formData.get('school_id') as string,
      game_id: formData.get('game_id') as string,
      time_taken: formData.get('time_taken') ? parseFloat(formData.get('time_taken') as string) : undefined,
      position: formData.get('position') ? parseInt(formData.get('position') as string) : undefined,
      score: formData.get('score') ? parseFloat(formData.get('score') as string) : undefined,
      is_qualified: formData.get('is_qualified') === 'true',
      notes: formData.get('notes') as string || undefined,
    };

    try {
      if (editingParticipant) {
        await updateParticipant.mutateAsync({ id: editingParticipant.id, ...data });
        toast.success('Participant updated successfully');
      } else {
        await createParticipant.mutateAsync(data);
        toast.success('Participant added successfully');
      }
      setParticipantDialog(false);
      setEditingParticipant(null);
    } catch (error) {
      toast.error('Failed to save participant');
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteDialog) return;
    
    try {
      if (deleteDialog.type === 'game') {
        await deleteGame.mutateAsync(deleteDialog.id);
        toast.success('Game deleted');
      } else if (deleteDialog.type === 'school') {
        await deleteSchool.mutateAsync(deleteDialog.id);
        toast.success('School deleted');
      } else {
        await deleteParticipant.mutateAsync(deleteDialog.id);
        toast.success('Participant deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
    setDeleteDialog(null);
  };

  // Qualifier selection
  const handleOpenQualifyDialog = (game: Game) => {
    setSelectedGameForQualify(game);
    const gameParticipants = participants.filter(p => p.game_id === game.id);
    setSelectedQualifiers(gameParticipants.filter(p => p.is_qualified).map(p => p.id));
    setQualifyDialog(true);
  };

  const handleSaveQualifiers = async () => {
    if (!selectedGameForQualify) return;
    
    try {
      await bulkUpdateQualified.mutateAsync({
        gameId: selectedGameForQualify.id,
        qualifiedIds: selectedQualifiers,
      });
      toast.success('Qualifiers updated');
      setQualifyDialog(false);
    } catch (error) {
      toast.error('Failed to update qualifiers');
    }
  };

  const handleRankByTime = async (gameId: string) => {
    try {
      await rankByTime.mutateAsync(gameId);
      toast.success('Participants ranked by time');
    } catch (error) {
      toast.error('Failed to rank participants');
    }
  };

  // Filtered data
  const filteredGames = filterCategory === 'all' 
    ? games 
    : games.filter(g => g.category === filterCategory);

  const filteredParticipants = filterGame === 'all'
    ? participants
    : participants.filter(p => p.game_id === filterGame);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Games</p>
                <p className="text-2xl font-display">{games.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Participants</p>
                <p className="text-2xl font-display">{participants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Schools</p>
                <p className="text-2xl font-display">{schools.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Qualified</p>
                <p className="text-2xl font-display">{participants.filter(p => p.is_qualified).length}</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : (
          <Tabs defaultValue="games" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="games" className="gap-2">
                <Target className="w-4 h-4" />
                Games
              </TabsTrigger>
              <TabsTrigger value="participants" className="gap-2">
                <Users className="w-4 h-4" />
                Participants
              </TabsTrigger>
              <TabsTrigger value="schools" className="gap-2">
                <MapPin className="w-4 h-4" />
                Schools
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as GameCategory | 'all')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ball_games">Ball Games</SelectItem>
                      <SelectItem value="athletes">Athletes</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setEditingGame(null); setGameDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Qualifiers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGames.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No games found. Add your first game!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGames.map(game => (
                        <TableRow key={game.id}>
                          <TableCell className="font-medium">{game.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{CATEGORY_LABELS[game.category]}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{LEVEL_LABELS[game.level]}</Badge>
                          </TableCell>
                          <TableCell>
                            {game.is_timed ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                Timed
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Standard</span>
                            )}
                          </TableCell>
                          <TableCell>Top {game.max_qualifiers}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {game.is_timed && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRankByTime(game.id)}
                                >
                                  <Timer className="w-4 h-4 mr-1" />
                                  Rank
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenQualifyDialog(game)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Qualify
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingGame(game); setGameDialog(true); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteDialog({ type: 'game', id: game.id })}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={filterGame} onValueChange={setFilterGame}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Filter by game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      {games.map(game => (
                        <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setEditingParticipant(null); setParticipantDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Participant
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No participants found. Add your first participant!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParticipants.map(participant => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.first_name} {participant.last_name}
                          </TableCell>
                          <TableCell>{participant.school?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{participant.game?.name}</Badge>
                          </TableCell>
                          <TableCell>{participant.position || '-'}</TableCell>
                          <TableCell>
                            {participant.time_taken ? `${participant.time_taken}s` : '-'}
                          </TableCell>
                          <TableCell>{participant.score ?? '-'}</TableCell>
                          <TableCell>
                            {participant.is_qualified ? (
                              <Badge className="bg-success text-success-foreground">Qualified</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingParticipant(participant); setParticipantDialog(true); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteDialog({ type: 'participant', id: participant.id })}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Schools Tab */}
            <TabsContent value="schools" className="space-y-4">
              <div className="flex items-center justify-end">
                <Button onClick={() => { setEditingSchool(null); setSchoolDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add School
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Sub-County</TableHead>
                      <TableHead>County</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No schools found. Add your first school!
                        </TableCell>
                      </TableRow>
                    ) : (
                      schools.map(school => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>{school.zone}</TableCell>
                          <TableCell>{school.subcounty}</TableCell>
                          <TableCell>{school.county}</TableCell>
                          <TableCell>{school.region}</TableCell>
                          <TableCell>{school.country}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingSchool(school); setSchoolDialog(true); }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteDialog({ type: 'school', id: school.id })}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Game Dialog */}
      <Dialog open={gameDialog} onOpenChange={setGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveGame(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Game Name</Label>
                <Input id="name" name="name" defaultValue={editingGame?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="category" defaultValue={editingGame?.category || 'ball_games'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ball_games">Ball Games</SelectItem>
                      <SelectItem value="athletes">Athletes</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select name="level" defaultValue={editingGame?.level || 'zone'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zone">Zone</SelectItem>
                      <SelectItem value="subcounty">Sub-County</SelectItem>
                      <SelectItem value="county">County</SelectItem>
                      <SelectItem value="region">Region</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingGame?.description || ''} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="is_timed" 
                    name="is_timed"
                    defaultChecked={editingGame?.is_timed}
                    onCheckedChange={(checked) => {
                      const input = document.querySelector('input[name="is_timed"]') as HTMLInputElement;
                      if (input) input.value = checked ? 'true' : 'false';
                    }}
                  />
                  <input type="hidden" name="is_timed" defaultValue={editingGame?.is_timed ? 'true' : 'false'} />
                  <Label htmlFor="is_timed">Timed Event (for races)</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_qualifiers">Max Qualifiers</Label>
                <Input 
                  id="max_qualifiers" 
                  name="max_qualifiers" 
                  type="number" 
                  min="1" 
                  defaultValue={editingGame?.max_qualifiers || 5} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGameDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* School Dialog */}
      <Dialog open={schoolDialog} onOpenChange={setSchoolDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSchool(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name</Label>
                <Input id="school_name" name="name" defaultValue={editingSchool?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" name="zone" defaultValue={editingSchool?.zone} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcounty">Sub-County</Label>
                  <Input id="subcounty" name="subcounty" defaultValue={editingSchool?.subcounty} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input id="county" name="county" defaultValue={editingSchool?.county} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" name="region" defaultValue={editingSchool?.region} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={editingSchool?.country || 'Kenya'} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSchoolDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Participant Dialog */}
      <Dialog open={participantDialog} onOpenChange={setParticipantDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingParticipant ? 'Edit Participant' : 'Add New Participant'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveParticipant(new FormData(e.currentTarget)); }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" defaultValue={editingParticipant?.first_name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" defaultValue={editingParticipant?.last_name} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Select name="school_id" defaultValue={editingParticipant?.school_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Game</Label>
                <Select name="game_id" defaultValue={editingParticipant?.game_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map(game => (
                      <SelectItem key={game.id} value={game.id}>{game.name} ({LEVEL_LABELS[game.level]})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" name="position" type="number" min="1" defaultValue={editingParticipant?.position || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_taken">Time (seconds)</Label>
                  <Input id="time_taken" name="time_taken" type="number" step="0.001" defaultValue={editingParticipant?.time_taken || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input id="score" name="score" type="number" step="0.01" defaultValue={editingParticipant?.score || ''} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="is_qualified" 
                  defaultChecked={editingParticipant?.is_qualified}
                  onCheckedChange={(checked) => {
                    const input = document.querySelector('input[name="is_qualified"]') as HTMLInputElement;
                    if (input) input.value = checked ? 'true' : 'false';
                  }}
                />
                <input type="hidden" name="is_qualified" defaultValue={editingParticipant?.is_qualified ? 'true' : 'false'} />
                <Label htmlFor="is_qualified">Qualified for next level</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={editingParticipant?.notes || ''} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setParticipantDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Qualify Dialog */}
      <Dialog open={qualifyDialog} onOpenChange={setQualifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Qualifiers - {selectedGameForQualify?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Select up to {selectedGameForQualify?.max_qualifiers} participants to qualify for the next level.
              Selected: {selectedQualifiers.length}/{selectedGameForQualify?.max_qualifiers}
            </p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {participants
                .filter(p => p.game_id === selectedGameForQualify?.id)
                .sort((a, b) => (a.position || 999) - (b.position || 999))
                .map(participant => (
                  <div 
                    key={participant.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedQualifiers.includes(participant.id)
                        ? 'bg-success/10 border-success'
                        : 'bg-card border-border hover:border-secondary'
                    }`}
                    onClick={() => {
                      if (selectedQualifiers.includes(participant.id)) {
                        setSelectedQualifiers(prev => prev.filter(id => id !== participant.id));
                      } else if (selectedQualifiers.length < (selectedGameForQualify?.max_qualifiers || 5)) {
                        setSelectedQualifiers(prev => [...prev, participant.id]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedQualifiers.includes(participant.id)
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted'
                      }`}>
                        {selectedQualifiers.includes(participant.id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{participant.position || '-'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{participant.first_name} {participant.last_name}</p>
                        <p className="text-sm text-muted-foreground">{participant.school?.name}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {participant.time_taken && <span>{participant.time_taken}s</span>}
                      {participant.score && <span>Score: {participant.score}</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQualifyDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveQualifiers}>Save Qualifiers</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteDialog?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
