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
  const [issues, setIssues] = useState([])

  useEffect(() => {
    console.log("un effect pour voir mon issue", issues)
  }, [issues])


  useEffect(() => {    
    // faut charger les repos grace a l'api
    async function getIssues() {
      let repositories = await Api.getRepositories()
      console.log("voici les repo de l'user", repositories)
      let tempIssues = []
      for (let x = 0; x < 10; x++) {
        // on charge les issues
        let repositoriesIssues = await viewListIssue({ repositoryName: repositories.results[x].name })
        if (repositoriesIssues.length > 0) {
          repositoriesIssues.forEach( async (issue) => {
            tempIssues.push(issue)
          })
        }
      }
      setIssues(tempIssues)
    } getIssues()
  }, [])


  return (
    <ScrollView
      style={cls`flex-1 w-full h-full bg-gray-800`}
      contentContainerStyle={cls`items-center justify-start`}
    >
      <Navbar navigation={navigation}></Navbar>
      <Stack horizontal style={cls`w-2/3 m8 p8 rounded bg-gray-700`}>
        <Stack horizontal style={cls`flex-wrap w-full`}>
          <Title style={cls`text-white`}> Mes demandes en cours</Title>

          {issues && (
                <DemandeBase
                  issues={issues}
                  navigation={navigation}
                />            
            )}
        </Stack>

      </Stack>

    </ScrollView>
  );
}
