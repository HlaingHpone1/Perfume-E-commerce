import { auth } from "@/config/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  getSession,
  forgetPassword,
  resetPassword,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
