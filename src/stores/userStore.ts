import { create } from 'zustand';
import type { UserInfo } from '@/api/system/user/types';
import defaultAvatar from '@/assets/images/profile.jpg';

interface UserState {
  userInfo?: UserInfo;
  setUserInfo: (userInfo?: UserInfo) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>(set => ({
  userInfo: undefined,
  setUserInfo: userInfo =>
    set({
      userInfo: userInfo
        ? {
            ...userInfo,
            user: {
              ...userInfo.user,
              avatarUrl: userInfo.user.avatarUrl || defaultAvatar
            }
          }
        : undefined
    }),
  clearUserInfo: () => set({ userInfo: undefined })
}));
