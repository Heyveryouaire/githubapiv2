import React, { useState, useCallback } from "react";

import { classes as cls, View, color } from "tw";

import { Title } from "components/typography";
import { SignUpBase } from "components/Signup";

import { useUserStore } from "src/stores/user"

import { useUser } from "src/hooks/user"


export default function SignupPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUp, getUserToken } = useUser();


  const fakeSubmit = async params => {
      console.log("SIGNUPAGE", params);
      
    setLoading(true);
      try {
        await signUp(params);
        setToken(getUserToken());
      } catch (err) {
        setError(err);
        setLoading(false);
      }
      setLoading(false);
    }

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);


  return (
    <View style={cls`flex-1 w-full flex-col justify-center items-center`}>
      <View style={cls`w64`}>
        <Title>Créez votre compte</Title>
        <SignUpBase
          color={color.blue600}
          errorColor={color.red500}
          onSubmit={fakeSubmit}
          submissionError={error}
          clearSubmissionError={clearError}
          submissionLoading={loading}
        />
      </View>
    </View>
  );
}
