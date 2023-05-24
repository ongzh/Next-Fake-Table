import { AuthenticationContext } from "@/app/context/AuthContext";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useContext } from "react";

export const useAuth = () => {
  const { error, loading, data, setAuthState } = useContext(
    AuthenticationContext
  );

  const signin = async (
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
    handleClose = () => {}
  ) => {
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
      handleClose();
    } catch (error: any) {
      console.log(error.response.data.errorMessage);
      setAuthState({
        loading: false,
        error: error.response.data.errorMessage,
        data: null,
      });
    }
  };
  const signup = async (
    {
      firstName,
      lastName,
      email,
      password,
      city,
      phoneNumber,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      city: string;
      phoneNumber: string;
    },
    handleClose = () => {}
  ) => {
    setAuthState({ loading: true, error: null, data: null });
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/signup",
        {
          email,
          password,
          firstName,
          lastName,
          city,
          phoneNumber,
        }
      );
      setAuthState({ loading: false, error: null, data: response.data });
      handleClose();
    } catch (error: any) {
      console.log(error.response.data.errorMessage);
      setAuthState({
        loading: false,
        error: error.response.data.errorMessage,
        data: null,
      });
    }
  };

  return { signin, signup };
};
