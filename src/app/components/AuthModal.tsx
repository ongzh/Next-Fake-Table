"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { use, useEffect, useState } from "react";
import AuthModelInputs from "./AuthModalInputs";
import { useAuth } from "../../hooks/useAuth";
import { useContext } from "react";
import { AuthenticationContext } from "../context/AuthContext";
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",

  boxShadow: 24,
  p: 4,
};

export default function AuthModal({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { signin } = useAuth();
  const { error, loading, data } = useContext(AuthenticationContext);

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone_number: "",
    city: "",
    password: "",
  });

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      if (inputs.password && inputs.email) {
        return setDisabled(false);
      }
    } else {
      if (
        inputs.firstName &&
        inputs.lastName &&
        inputs.email &&
        inputs.password &&
        inputs.city &&
        inputs.phone_number
      ) {
        return setDisabled(false);
      }
    }
    setDisabled(true);
  }, [inputs]);

  const handleClick = () => {
    if (isSignedIn) {
      return signin({ email: inputs.email, password: inputs.password });
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const renderContent = (signInContent: string, signUpContent: string) => {
    return isSignedIn ? signInContent : signUpContent;
  };
  return (
    <div>
      <button
        className={`${renderContent(
          "bg-blue-400 text-white ",
          ""
        )}border p-1 px-4 rounded mr-3`}
        onClick={handleOpen}
      >
        {renderContent("Sign In", "Sign Up")}
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {loading ? (
            <div>loading...</div>
          ) : (
            <div className="p-2 h-[600px]">
              <div className="uppercase font-bold text-center pb-2 border-b mb-2">
                <p className="text-sm">
                  {renderContent("Sign In", "Create Account")}
                </p>
              </div>
              <div className="m-auto">
                <h2 className="text-2xl font-light text-center">
                  {renderContent(
                    "Login To Your Account",
                    "Create Your FakeTable Account"
                  )}
                </h2>
                <AuthModelInputs
                  inputs={inputs}
                  handleChangeInput={handleChangeInput}
                  isSignedIn={isSignedIn}
                />
                <button
                  className="uppercase bg-red-600 w-full text-white p-3 rounded text-sm mb-5 disabled:bg-gray-400"
                  disabled={disabled}
                  onClick={handleClick}
                >
                  {renderContent("Sign In", "Create Account")}
                </button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
}
