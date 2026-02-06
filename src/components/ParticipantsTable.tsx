import { Participant, LEVEL_LABELS } from '@/types/database';
import { Trophy, Medal, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ParticipantsTableProps {
  participants: Participant[];
  isTimed?: boolean;
  showGame?: boolean;
}

const formatTime = (seconds?: number) => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}s`;
};

const getPositionBadge = (position?: number) => {
  if (!position) return null;
  if (position === 1) {
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <Trophy className="w-5 h-5" />
        <span className="font-bold">1st</span>
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Medal className="w-5 h-5" />
        <span className="font-bold">2nd</span>
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex items-center gap-1 text-amber-700">
        <Medal className="w-5 h-5" />
        <span className="font-bold">3rd</span>
      </div>
    );
  }
  return <span className="text-muted-foreground">{position}th</span>;
};

export const ParticipantsTable = ({ participants, isTimed, showGame }: ParticipantsTableProps) => {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Location</TableHead>
            {showGame && <TableHead>Game</TableHead>}
            {isTimed && <TableHead className="text-right">Time</TableHead>}
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showGame ? 8 : 7} className="text-center py-12 text-muted-foreground">
                No participants yet
              </TableCell>
            </TableRow>
          ) : (
            participants.map((participant) => (
              <TableRow key={participant.id} className="hover:bg-muted/30">
                <TableCell>{getPositionBadge(participant.position)}</TableCell>
                <TableCell>
                  <div className="font-medium">
                    {participant.first_name} {participant.last_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">
                    {participant.school?.name || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{participant.school?.zone}, {participant.school?.subcounty}</div>
                      <div>{participant.school?.county}, {participant.school?.region}</div>
                    </div>
                  </div>
                </TableCell>
                {showGame && (
                  <TableCell>
                    <Badge variant="outline">{participant.game?.name}</Badge>
                  </TableCell>
                )}
                {isTimed && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 font-mono">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {formatTime(participant.time_taken)}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right font-medium">
                  {participant.score ?? '-'}
                </TableCell>
                <TableCell className="text-center">
                  {participant.is_qualified ? (
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Qualified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
