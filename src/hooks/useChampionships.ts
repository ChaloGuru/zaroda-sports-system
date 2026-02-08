import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Championship } from '@/types/database';

export const useChampionships = () => {
  return useQuery({
    queryKey: ['championships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Championship[];
    },
  });
};

export const useCreateChampionship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (championship: Omit<Championship, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('championships')
        .insert(championship)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['championships'] }),
  });
};

export const useUpdateChampionship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Championship> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('championships')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['championships'] }),
  });
};

export const useDeleteChampionship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('championships').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['championships'] }),
  });
};
