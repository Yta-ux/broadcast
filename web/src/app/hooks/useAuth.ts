import { useAuthContext } from "../context/auth-context";

export const useAuth = () => {
  const context = useAuthContext();
  return context;
};
