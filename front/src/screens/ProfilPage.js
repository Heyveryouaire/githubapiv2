import React, { useState, useCallback } from "react";
import { classes as cls, color, View, ScrollView } from "tw";
import { useUserStore, userApi } from "src/stores/user";
import { Title} from "components/typography";

import Stack from "components/layout/Stack";
import Navbar from "./parts/Nav";
import { ProfilBase } from "../components/Profil";
import { useUser } from "src/hooks/user"

export default function ProfilPage({ navigation }) {
  const token = useUserStore(({ token }) => token)
  const [ error, setError ] = useState(null)
  const [ success, setSuccess] = useState(null)
  const setToken = useUserStore(({ setToken}) => setToken)

  const profilUser = userApi.getState()
  const [ loading, setLoading ] = useState(false)
  const { updateProfil , getUserToken } = useUser()

  // const [showSnack, setShowSnack] = useState(false);useUserStore

  const fakeSubmit = async params => {
  setLoading(true);
    try {
      await updateProfil(params, token);
      setSuccess(true)
      setToken(token)
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
    <ScrollView
      style={cls`flex-1 w-full h-full`}
      contentContainerStyle={cls`m4 items-center justify-start`}
    >

      <Title>Gestion de compte</Title>
      <Navbar navigation={navigation}></Navbar>
      <View style={cls`w-1/2 bg-white`}>
        <Stack vertical style={cls`w-full`}>
          <ProfilBase
            color={color.blue600}
            errorColor={color.red500}
            onSubmit={fakeSubmit}
            submissionError={error}
            clearSubmissionError={clearError}
            submissionLoading={loading}
            success={success}
            profilUser={profilUser}
            >

          </ProfilBase>

        </Stack>
      </View>
    </ScrollView>
  );
}