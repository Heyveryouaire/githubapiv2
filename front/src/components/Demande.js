import React, { useEffect } from "react";
import { Text } from "react-native"

import { classes as cls, View } from "tw";

import Card from "./Card"
import Badge from "./Badge"
import Stack from "./layout/Stack"
import Button from "./form/Button";
import FlashBox from "./form/FlashBox";


export function DemandeBase({
  classes,
  submissionError,
  success,
  repositoryName,
  issues,

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
   
    <View style={[...cls`justify-center items-center`, ...classes.container]}>
      <View style={cls`w-full`}>
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
     

          {/* For each issue in the project */}
        { issues && issues.map( (issue, index) => {
          return (
            <Card direction="vertical" key={index}>
              <Card.Title>{repositoryName} - { issue.ticketIssueTitle }</Card.Title>
              <Card.Content>
                <Stack vertical style={cls`w-full`}>
                  {/* For each comments on the issue */}
                { issue.ticketIssueComments.map( (comment, index) => {
                  return (
                  <Text key={index}>{comment.body} le {comment.createdAt} </Text>
                    )
                  })}

                { issue.ticketIssueComments.length === 0 && (
                  <Text> Pas de commentaires .. </Text>
                )}
                  <Stack horizontal style={cls`w-auto flex-1 items-center justify-around`}>
                    <Button>Annuler le ticket</Button>
                    <Button>Editer le ticket</Button>
                  </Stack>
                </Stack>
              </Card.Content>
          </Card>
          )
        })          

      }
       </View>
     </View>
  )
}