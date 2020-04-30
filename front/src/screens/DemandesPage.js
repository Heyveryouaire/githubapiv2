import React, { useState, useEffect } from "react";
import { classes as cls, ScrollView } from "tw";
import Stack from "components/layout/Stack";
import Navbar from "./parts/Nav";
import { DemandeBase } from "/components/Demande";
import { useUser } from "src/hooks/user"
import { Title } from "/components/typography"
import Api from "../lib/api"


export default function DemandesPage({ navigation }) {
  const { viewListIssue } = useUser()
  const [ issues, setIssues ] = useState([])

  let userRepos = [
    { name : "graphql2" },
    { name : "exo" }
  ]

  useEffect(() => {
        // faut charger les repos grace a l'api
        const iss = async () => {
          let repositories = await Api.getRepositories()
          let tempIssues = []
          for(let x=0; x<4; x++){ 
            // on charge les issues
            let repositoriesIssues = await viewListIssue({ repositoryName: repositories.results[x].name})
            console.log("test repoissue", repositoriesIssues)
            if(repositoriesIssues.length > 0){
              tempIssues.push(repositoriesIssues)
            }
          }
          console.log('tempIssues', tempIssues)
          setIssues(tempIssues)
          
        }
  }, [])

  console.log(issues)
  return (
    <ScrollView
      style={cls`flex-1 w-full h-full bg-gray-800`}
      contentContainerStyle={cls`items-center justify-start`}
    >
      <Navbar navigation={navigation}></Navbar>
        <Stack horizontal style={cls`w-2/3 m8 p8 rounded bg-gray-700`}>
          <Stack horizontal style={cls`flex-wrap w-full`}>
            <Title style={cls`text-white`}> Mes demandes en cours</Title>

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
        </Stack>

    </ScrollView>
  );
}
