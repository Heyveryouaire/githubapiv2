import React, { useState, useEffect } from "react";
import { classes as cls, ScrollView } from "tw";
import Stack from "components/layout/Stack";
import Navbar from "./parts/Nav";
import { DemandeBase } from "/components/Demande";
import { useUser } from "src/hooks/user"

export default function DemandesPage({ navigation }) {
  const { viewListIssue } = useUser()
  const [ issues, setIssues ] = useState()
  let userRepos = [
    { name : "graphql2" }
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
      style={cls`flex-1 w-full h-full bg-gray-800`}
      contentContainerStyle={cls`items-center justify-start`}
    >
      <Navbar navigation={navigation}></Navbar>
        <Stack horizontal style={cls`w-2/3 m8 p8 rounded bg-gray-700`}>

          {issues && issues.map( (userRepo, index) => {
            return (
              <DemandeBase 
              key={index}
              repositoryName={userRepo.name}
              issues={userRepo.issues}
              navigation={navigation}
              />
            )
          })}
        </Stack>

    </ScrollView>
  );
}
