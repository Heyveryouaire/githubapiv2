import React, { useState, useCallback } from "react";
import { classes as cls, color, ScrollView } from "tw";
import { useUserStore, userApi } from "src/stores/user";
import Stack from "components/layout/Stack";
import Navbar from "./parts/Nav";
import { ProfilBase } from "../components/Profil";
import { useUser } from "src/hooks/user"

export default function ProfilPage({ navigation }) {
  const token = useUserStore(({ token }) => token)
  const [ error, setError ] = useState(null)
  const [ success, setSuccess] = useState(null)
  let profilUser = userApi.getState()
  const [ loading, setLoading ] = useState(false)
  const { updateProfil } = useUser()

  const fakeSubmit = async params => {
  setLoading(true);
    try {
      await updateProfil(params, token)
      setSuccess(true)
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
      style={cls`flex-1 w-full h-full bg-gray-800`}
      contentContainerStyle={cls`items-center justify-start`}
    >
      <Navbar navigation={navigation}></Navbar>

        <Stack horizontal style={cls` w-full sm:w-full md:w-full lg:w-2/3 xl:w-2/3 m8 p8 bg-gray-700 rounded`}>
          <ProfilBase
            color={color.blue600}
            errorColor={color.red500}
            onSubmit={fakeSubmit}
            submissionError={error}
            clearSubmissionError={clearError}
            submissionLoading={loading}
            success={success}
            profilUser={profilUser}
            classes={ {input: `bg-white`, label:"text-white"} }
            >

          </ProfilBase>

      </Stack>
    </ScrollView>
  );
}
