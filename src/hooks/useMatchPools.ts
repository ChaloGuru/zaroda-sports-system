import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MatchPool } from '@/types/database';

export const useMatchPools = (gameId?: string) => {
  return useQuery({
    queryKey: ['match_pools', gameId],
    queryFn: async () => {
      let query = supabase
        .from('match_pools')
        .select(`
          *,
          team_a_school:schools!match_pools_team_a_school_id_fkey(*),
          team_b_school:schools!match_pools_team_b_school_id_fkey(*),
          winner_school:schools!match_pools_winner_school_id_fkey(*)
        `)
        .order('round_name', { ascending: true });
      if (gameId) query = query.eq('game_id', gameId);
      const { data, error } = await query;
      if (error) throw error;
      return data as MatchPool[];
    },
    enabled: !!gameId,
  });
};

export const useCreateMatchPool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (match: Omit<MatchPool, 'id' | 'created_at' | 'updated_at' | 'team_a_school' | 'team_b_school' | 'winner_school'>) => {
      const { data, error } = await supabase
        .from('match_pools')
        .insert(match)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match_pools'] }),
  });
};

export const useUpdateMatchPool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MatchPool> & { id: string }) => {
      const { team_a_school, team_b_school, winner_school, ...updateData } = data as any;
      const { data: result, error } = await supabase
        .from('match_pools')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match_pools'] }),
  });
};

export const useDeleteMatchPool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('match_pools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match_pools'] }),
  });
};
