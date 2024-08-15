"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type Props = {};

const SignUpButton = (props: Props) => {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        signIn("google");
      }}
    >
      Sign Up
    </Button>
  );
};

export default SignUpButton;
