import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface AuthContextType {
  user: User | null;
  tenantId: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantId: null,
  loading: true,
});

export const useAuthContext = () => useContext(AuthContext);
