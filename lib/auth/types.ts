export const APP_ROLES = ["user", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};

export type AuthContext =
  | {
      user: null;
      profile: null;
      isAuthenticated: false;
      isAdmin: false;
    }
  | {
      user: {
        id: string;
        email: string;
      };
      profile: UserProfile;
      isAuthenticated: true;
      isAdmin: boolean;
    };
