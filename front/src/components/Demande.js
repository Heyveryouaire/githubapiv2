import React, { useEffect } from "react";
import { Text } from "react-native"

import { classes as cls, View } from "tw";

import Card from "./Card"
import Stack from "./layout/Stack"
import Button from "./form/Button";
import { Title } from "./typography"
import FlashBox from "./form/FlashBox";
import Link from './form/Link'



export function DemandeBase({
  classes,
  submissionError,
  success,
  repositoryName,
  issues,
  navigation

}) {
  classes = classes || {};
  classes.container = classes.container || [];
  classes.control = classes.control || [];
  classes.label = classes.label || [];
  classes.input = classes.input || [];
  classes.helper = classes.helper || [];
  classes.forgottenText = classes.forgottenText || [];

  useEffect(() => {
    issues = issues
  }, [])


  return ( 
   
    <View style={[...cls`justify-center items-center w-full`, ...classes.container]}>
      <Stack vertical style={cls`w-full`}>
        {submissionError && (
          <FlashBox.Error>
            Impossible de modifier/supprimer le ticket
          </FlashBox.Error>
        )}
        {success && (
          <FlashBox.Success>
            Le ticket à bien été supprimer
          </FlashBox.Success>
        )}
     


            <Title style={cls`text-white`}> Mes demandes en cours</Title>
          {/* For each issue in the project */}
        { issues && issues.map( (issue, index) => {
          return (
            <Card direction="vertical" key={index} style={cls`bg-gray-700 border-gray-800`}>
              <Card.Title style={cls`text-white`}>
                { repositoryName }
                </Card.Title>  
              <Card.Content>
                <Stack horizontal style={cls`w-full bg-gray-400 h-px`}>

                </Stack>
              <Link
                classes={ { text: `text-blue-500`}}
                  onPress={() => { navigation.navigate("detailPage", {
                    title: issue.ticketIssueTitle,
                    issue: issue,
                    repository: repositoryName
                  }) }}
                  >
                {repositoryName} - { issue.ticketIssueTitle }
                </Link>
              </Card.Content>
          </Card>
          )
        })          

      }
          </Stack>
      </View>
  )
}