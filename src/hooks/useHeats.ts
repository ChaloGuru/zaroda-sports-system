import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heat, HeatParticipant } from '@/types/database';

export const useHeats = (gameId?: string) => {
  return useQuery({
    queryKey: ['heats', gameId],
    queryFn: async () => {
      let query = supabase
        .from('heats')
        .select('*')
        .order('heat_type', { ascending: true })
        .order('heat_number', { ascending: true });
      if (gameId) query = query.eq('game_id', gameId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Heat[];
    },
    enabled: !!gameId,
  });
};

export const useHeatParticipants = (heatId?: string) => {
  return useQuery({
    queryKey: ['heat_participants', heatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heat_participants')
        .select(`*, participant:participants(*, school:schools(*))`)
        .eq('heat_id', heatId!)
        .order('position', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as HeatParticipant[];
    },
    enabled: !!heatId,
  });
};

export const useAllHeatParticipants = (gameId?: string) => {
  return useQuery({
    queryKey: ['all_heat_participants', gameId],
    queryFn: async () => {
      // Get all heats for this game
      const { data: heats, error: heatsError } = await supabase
        .from('heats')
        .select('id')
        .eq('game_id', gameId!);
      if (heatsError) throw heatsError;
      
      const heatIds = heats.map(h => h.id);
      if (heatIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('heat_participants')
        .select(`*, participant:participants(*, school:schools(*)), heat:heats(*)`)
        .in('heat_id', heatIds)
        .order('position', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as HeatParticipant[];
    },
    enabled: !!gameId,
  });
};

export const useCreateHeat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (heat: Omit<Heat, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('heats')
        .insert(heat)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heats'] }),
  });
};

export const useDeleteHeat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('heats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heats'] });
      queryClient.invalidateQueries({ queryKey: ['heat_participants'] });
      queryClient.invalidateQueries({ queryKey: ['all_heat_participants'] });
    },
  });
};

export const useAddHeatParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hp: Omit<HeatParticipant, 'id' | 'created_at' | 'participant' | 'heat'>) => {
      const { data, error } = await supabase
        .from('heat_participants')
        .insert(hp)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat_participants'] });
      queryClient.invalidateQueries({ queryKey: ['all_heat_participants'] });
    },
  });
};

export const useUpdateHeatParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<HeatParticipant> & { id: string }) => {
      const { participant, heat, ...updateData } = data as any;
      const { data: result, error } = await supabase
        .from('heat_participants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat_participants'] });
      queryClient.invalidateQueries({ queryKey: ['all_heat_participants'] });
    },
  });
};

export const useDeleteHeatParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('heat_participants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heat_participants'] });
      queryClient.invalidateQueries({ queryKey: ['all_heat_participants'] });
    },
  });
};
