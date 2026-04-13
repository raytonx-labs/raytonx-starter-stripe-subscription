import type { Tables } from "@/lib/supabase/database";

export const APP_ROLES = ["user", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type UserProfile = Tables<"user_profiles">;

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
