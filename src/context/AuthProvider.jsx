import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { accounts } from "../data/accounts";

const storageKey = "concert-user-id";

function getProfile(account) {
  if (!account) return null;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

function getInitialUser() {
  try {
    return getProfile(
      accounts.find(
        (account) => account.id === localStorage.getItem(storageKey),
      ),
    );
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(storageKey, user.id);
      else localStorage.removeItem(storageKey);
    } catch {
      // Phiên trong bộ nhớ vẫn hoạt động khi trình duyệt chặn storage.
    }
  }, [user]);

  function login(email, password) {
    const account = accounts.find(
      (item) =>
        item.email === email.trim().toLowerCase() && item.password === password,
    );
    if (!account) throw new Error("Email hoặc mật khẩu không đúng.");
    const profile = getProfile(account);
    setUser(profile);
    return profile;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
