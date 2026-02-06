import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Participant } from '@/types/database';

export const useParticipants = (gameId?: string) => {
  return useQuery({
    queryKey: ['participants', gameId],
    queryFn: async () => {
      let query = supabase
        .from('participants')
        .select(`
          *,
          school:schools(*),
          game:games(*)
        `)
        .order('position', { ascending: true, nullsFirst: false });
      
      if (gameId) {
        query = query.eq('game_id', gameId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Participant[];
    },
  });
};

export const useCreateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at' | 'school' | 'game'>) => {
      const { data, error } = await supabase
        .from('participants')
        .insert(participant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
};

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...participant }: Partial<Participant> & { id: string }) => {
      const { school, game, ...updateData } = participant as any;
      const { data, error } = await supabase
        .from('participants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
};

export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
};

export const useBulkUpdateQualified = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId, qualifiedIds }: { gameId: string; qualifiedIds: string[] }) => {
      // First, set all participants in this game to not qualified
      await supabase
        .from('participants')
        .update({ is_qualified: false })
        .eq('game_id', gameId);
      
      // Then set the selected ones as qualified
      if (qualifiedIds.length > 0) {
        await supabase
          .from('participants')
          .update({ is_qualified: true })
          .in('id', qualifiedIds);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
};

export const useRankByTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: string) => {
      // Get all participants for this game with time
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('game_id', gameId)
        .not('time_taken', 'is', null)
        .order('time_taken', { ascending: true });
      
      if (error) throw error;
      
      // Update positions based on time ranking
      for (let i = 0; i < participants.length; i++) {
        await supabase
          .from('participants')
          .update({ position: i + 1 })
          .eq('id', participants[i].id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
};
