import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

/** Reads the `admin` custom claim set on the Firebase user's ID token. */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    user.getIdTokenResult().then((res) => setIsAdmin(Boolean(res.claims.admin)));
  }, [user]);

  return isAdmin;
}
