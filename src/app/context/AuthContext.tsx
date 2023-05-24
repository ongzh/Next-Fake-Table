"use client";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { getCookie } from "cookies-next";
//if server components are children, parent component can be client
//applied in layout.tsx to allow all client components to have access to AuthStates
import React, { useState, createContext, useEffect } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  phone_number: string;
}

interface State {
  loading: boolean;
  error: string | null;
  data: User | null;
}

interface AuthState extends State {
  setAuthState: React.Dispatch<React.SetStateAction<State>>;
}

export const AuthenticationContext = createContext<AuthState>({
  loading: false,
  error: null,
  data: null,
  setAuthState: () => {},
});

export default function AuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<State>({
    loading: true,
    data: null,
    error: null,
  });

  const fetchUser = async () => {
    setAuthState({ loading: true, error: null, data: null });
    try {
      const jwt = getCookie("jwt");
      if (!jwt) {
        return setAuthState({ loading: false, error: null, data: null });
      }
      //go to auth/me to verify the jwt token
      const response = await axios.get("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      //default all request to have token after verified
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
      //set user info in data
      setAuthState({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      setAuthState({
        loading: false,
        error: error.response.data.errorMessage,
        data: null,
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ ...authState, setAuthState }}>
      {children}
    </AuthenticationContext.Provider>
  );
}
