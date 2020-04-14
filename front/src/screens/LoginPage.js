import React, { useState, useCallback } from "react";

import { classes as cls, View, color } from "tw";

import { Title } from "components/typography";
import { LoginBase } from "components/Login";

import { useUserStore } from "src/stores/user";

import { useUser } from "src/hooks/user"

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logIn, getUserToken } = useUser();


  const setToken = useUserStore(({ setToken }) => setToken);

  // TODO: Replace this with an actual API call
  const fakeSubmit = useCallback(
    async credentials => {

      setLoading(true);
      try {
        await logIn(credentials);
        console.log("getusertoken", getUserToken());
        
        setToken(getUserToken());
      } catch (err) {
        setError(err);
        setLoading(false);
      }
      setLoading(false);


    //   setLoading(true);

    //   setTimeout(() => {
    //     if (credentials.username == "asdf" && credentials.password == "asdf") {
    //       setToken("token");
    //     } else {
    //       setError(new Error("Bad Credentials"));
    //     }
    //     setLoading(false);
    //   }, 3000);
    },
    [setError, setLoading]


  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return (
    <View style={cls`flex-1 w-full flex-col justify-center items-center`}>
      <View style={cls`w64`}>
        <Title>Connexion</Title>
        <LoginBase
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
