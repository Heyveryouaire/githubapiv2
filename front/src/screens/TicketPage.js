import React, { useState, useCallback } from "react";

import { classes as cls, color, View, ScrollView } from "tw";
import { Title } from "components/typography";
import { TicketBase } from "components/Ticket"

import Navbar from "./parts/Nav";
import { useUser } from "src/hooks/user" 
import Snackbar from "components/Snackbar";

export default function TicketPage({ navigation }) {

  // const token = useUserStore(({ token }) => token);
  const [ error, setError ] = useState(null)
  const [ loading, setLoading ] = useState(false)
  const { createIssue , getUserToken } = useUser()

  const [showSnack, setShowSnack] = useState(false);
  console.log("HomePage -> showSnack", showSnack);

  const fakeSubmit = async params => {
    console.log("TICKETPAGE ", params);
    
  setLoading(true);
    try {
      
      await createIssue(params);
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
    <ScrollView
      style={cls`flex-1 w-full h-full`}
      contentContainerStyle={cls`m4 items-center justify-start`}
    >

      <Title>Créer un ticket</Title>
      <Navbar navigation={navigation}></Navbar>

      <View style={cls`w-full sm:w-full md:w-1/2 lg:w-1/2 xl:w1/2`}>
        
        <TicketBase
          color={color.blue600}
          errorColor={color.red500}
          onSubmit={fakeSubmit}
          submissionError={error}
          clearSubmissionError={clearError}
          submissionLoading={loading}>

        </TicketBase>

        <Snackbar
          visible={showSnack}
          onDismiss={() => setShowSnack(false)}
          actions={[
            {
              text: "Ok"
            }
          ]}
        >
          Votre ticket à bien été transmis
        </Snackbar>
      </View>
      
    </ScrollView>
  );
}
