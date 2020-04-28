import React, { useState, useCallback } from "react";

import { classes as cls, color, View, ScrollView } from "tw";
import { Title } from "components/typography";
import { TicketBase } from "components/Ticket"

import Navbar from "./parts/Nav";
import { useUser } from "src/hooks/user" 
import Stack from "components/layout/Stack"

export default function TicketPage({ navigation }) {
  const [ error, setError ] = useState(null)
  const [ success, setSuccess] = useState(null)
  const [ loading, setLoading ] = useState(false)
  const { createIssue } = useUser()

  const fakeSubmit = async params => {    
    console.log("parametre envoie formulaire", params);
    
  setLoading(true);
    try {
  
      await createIssue(params);
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
      
      <Stack vertical style={cls`w-2/3 m8 p8 bg-gray-700 rounded`}>

      {/* <View style={cls`w-full sm:w-full md:w-1/2 lg:w-1/2 xl:w1/2`}> */}
        <TicketBase
          color={color.blue600}
          errorColor={color.red500}
          onSubmit={fakeSubmit}
          submissionError={error}
          clearSubmissionError={clearError}
          submissionLoading={loading}
          success={success}
          classes={{ input: `bg-white`, label : `text-white`}} // 2 classes breaks ?
          >
        </TicketBase>
      {/* </View> */}
      </Stack>
      
    </ScrollView>
  );
}
