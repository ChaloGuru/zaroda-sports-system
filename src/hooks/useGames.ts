import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory, CompetitionLevel } from '@/types/database';

export const useGames = (category?: GameCategory) => {
  return useQuery({
    queryKey: ['games', category],
    queryFn: async () => {
      let query = supabase.from('games').select('*').order('name');
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Game[];
    },
  });
};

export const useGame = (id: string) => {
  return useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Game;
    },
    enabled: !!id,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: Omit<Game, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('games')
        .insert(game)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['games'] }),
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...game }: Partial<Game> & { id: string }) => {
      const { data, error } = await supabase
        .from('games')
        .update(game)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['games'] }),
  });
};
