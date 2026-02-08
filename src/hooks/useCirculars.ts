import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Circular } from '@/types/database';

export const useCirculars = () => {
  return useQuery({
    queryKey: ['circulars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circulars')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Circular[];
    },
  });
};

export const useCreateCircular = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (circular: Omit<Circular, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('circulars')
        .insert(circular)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circulars'] }),
  });
};

export const useUpdateCircular = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Circular> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('circulars')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circulars'] }),
  });
};

export const useDeleteCircular = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('circulars').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circulars'] }),
  });
};
