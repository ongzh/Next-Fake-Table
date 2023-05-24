import { AuthenticationContext } from "@/app/context/AuthContext";
import axios from "axios";
import { useContext } from "react";

export const useAuth = () => {
  const { error, loading, data, setAuthState } = useContext(
    AuthenticationContext
  );

  const signin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setAuthState({ loading: true, error: null, data: null });
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/signin",
        {
          email,
          password,
        }
      );
      setAuthState({ loading: false, error: null, data: response.data });
    } catch (error: any) {
      console.log(error.response.data.errorMessage);
      setAuthState({
        loading: false,
        error: error.response.data.errorMessage,
        data: null,
      });
    }
  };
  const signup = async () => {};
  return { signin, signup };
};
