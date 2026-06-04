import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { UserUpdate } from '../domain/entities/user';
import { getDependencies } from '../lib/di';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const PROFILE_QUERY_KEY = (userId: string) => ['profile', userId] as const;

// ─── useProfile ───────────────────────────────────────────────────────────────

export function useProfile(userId: string | null) {
  const { userRepository } = getDependencies();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('No userId');
      const result = await userRepository.getProfile(userId);

      if (result.isErr()) {
        // Profil yoksa otomatik oluştur (savunma katmanı — P1)
        if (result.error._tag === 'NotFound') {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const createResult = await userRepository.createProfile({
              id: user.id,
              email: user.email ?? '',
              fullName: user.user_metadata?.full_name ?? null,
            });
            if (createResult.isOk()) return createResult.value;
          }
        }
        throw new Error(result.error.message);
      }

      return result.value;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 dakika boyunca taze sayılır
  });
}

// ─── useUpdateProfile ─────────────────────────────────────────────────────────

interface UpdateProfileVariables {
  userId: string;
  data: UserUpdate;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { userRepository } = getDependencies();

  return useMutation({
    mutationFn: async (vars: UpdateProfileVariables) => {
      const result = await userRepository.updateProfile(vars.userId, vars.data);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },

    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY(vars.userId) });

      // Auth user_metadata'yı da sync et (P3)
      if (vars.data.fullName !== undefined) {
        supabase.auth.updateUser({
          data: { full_name: vars.data.fullName },
        });
      }
    },
  });
}
