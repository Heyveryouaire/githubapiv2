import React, { useState, useEffect } from "react";
import { classes as cls, View, ScrollView } from "tw";
import { useUserStore, userApi } from "src/stores/user";
import { Title} from "components/typography";

import Stack from "components/layout/Stack";
import Navbar from "./parts/Nav";
import { DemandeBase } from "/components/Demande";
import { useUser } from "src/hooks/user"

export default function DemandesPage({ navigation }) {
  const token = useUserStore(({ token }) => token)
  const { viewListIssue } = useUser()
  const [ issues, setIssues ] = useState()

  let userRepos = [
    { name : "graphql2" },
    { name : "exo"},
    { name : "boum"}
  ]

    useEffect( () => {     
      async function putData () {
        for(let x=0; x<userRepos.length; x++){     
          userRepos[x].issues = await viewListIssue( { repositoryName: userRepos[x].name })
        }
        setIssues( userRepos )
      } putData()
    }, [])

  return (
    <ScrollView
      style={cls`flex-1 w-full h-full`}
      contentContainerStyle={cls`m4 items-center justify-start`}
    >

      <Title>Statut de mes demandes</Title>
      <Navbar navigation={navigation}></Navbar>

      <View style={cls`w-1/2 bg-white`}>
        <Stack vertical style={cls`w-full`}>

          {issues && issues.map( (userRepo, index) => {
            return (
              <DemandeBase 
              key={index}
              repositoryName={userRepo.name}
              issues={userRepo.issues}
              />

            )
          })}
        </Stack>
      </View>
    </ScrollView>
  );
}
