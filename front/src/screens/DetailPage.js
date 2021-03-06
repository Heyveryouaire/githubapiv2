import React, { useState, useEffect } from "react";

import { classes as cls, View, ScrollView } from "tw";
import { Title } from "components/typography";
import { Text } from "react-native"

import Navbar from "./parts/Nav";
import Card from "../components/Card";
import Button from "../components/form/Button";
import Stack from "../components/layout/Stack"
import IconButton from "../components/form/IconButton"
import Input from "../components/form/Input"
import { useParamsStore } from "../stores/params"
import { useUser } from "src/hooks/user"
import FlashBox from "../components/form/FlashBox"

export default function DetailPage({ route, navigation }) {

  const [editionIssue, setEditionIssue] = useState(false)
  const [editionComment, setEditComment] = useState(false)
  const [ error, setError] = useState(null)
  const [ success, setSuccess] = useState(false)

  const [issueId, setissueId] = useState("")
  const [issueTitle, setIssueTitle] = useState("")
  const [issueBody, setIssueBody] = useState("")
  const [commentBody, setCommentBody] = useState("")
  const [messageComment, setMessageComment] = useState("")

  const { updateIssue, sendMessage } = useUser()
  const currentComment = "Je suis un commentaire ... "

  const setParams = useParamsStore(({ setParams }) => setParams)
  let currentParams = {}

  if (route.params) {
    setParams(route.params)
    currentParams = useParamsStore(({ params }) => params)
  } else {
    currentParams = useParamsStore(({ params }) => params)
  }
  // let currentParams ={} = useParamsStore(( { params }) => params)

  useEffect(() => {
    setissueId(currentParams.issue.ticketIssueId)
    setIssueTitle(currentParams.issue.ticketIssueTitle)
    setIssueBody(currentParams.issue.ticketIssueBody)
    setCommentBody(currentComment)
  }, [currentParams])

  const submit = async () => {
    let test = await updateIssue({ id: issueId, title: issueTitle, body: issueBody })
    console.log("retour de lupdate", test.issue)
    setIssueTitle(issueTitle)
  }

  const sendComment = async () => {
    if(messageComment !== ""){
      try{
        let test = await sendMessage({ subjectId: issueId, message: messageComment})
        setMessageComment("")
        setSuccess(true)
        console.log("resultat de la requete dans detailpage ",test)

      }catch(err){
        console.log("Impossible d'ajouter un commentaire")
        setError(err)
      }
      // Maintenant faut faire remonter l'état .. 
    }else{
      console.log("Aucun message n'a été défini")
      // Throw something 
    }
  }

  const clearError = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <ScrollView
      style={cls`flex-1 w-full h-full bg-gray-800`}
      contentContainerStyle={cls`items-center justify-start`}
    >
      <Navbar navigation={navigation}></Navbar>
      <Stack vertical style={cls` w-full sm:w-full md:w-full lg:w-2/3 xl:w-2/3 m8 p8 bg-gray-700 rounded`}>
      <Stack horizontal style={cls`w-full justify-center`}>
        {error && (
          <FlashBox.Error>
            Impossible d'envoyer votre commentaire
          </FlashBox.Error>
        )}
        {success && (
          <FlashBox.Success>
            Votre commentaire à bien été envoyé
          </FlashBox.Success>
        )}
        </Stack>
          <Title style={cls`text-center sm:text-center md:text-center lg:text-left xl:text-left text-white`}>Détails d'un ticket</Title>
        <Stack horizontal style={cls`w-full`}>
          <View style={cls`flex justify-center items-center w-full`}>
            {/* <View style={cls`flex justify-center items-center xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-full`}> */}
            <Card direction="" style={cls`bg-gray-700 border-gray-800 flex-1 justify-center w-full`}>
              {/* Header */}
              <Card.Title>
                <Stack horizontal style={cls`flex-wrap w-full h-auto items-center justify-around`}>
                  {editionIssue ?
                    <Stack horizontal style={cls`flex-1`}>
                      <Input
                        classes={{ input: "bg-white", label: "text-white" }}
                        label="Nouveau titre"
                        autoFocus
                        value={issueTitle}
                        onValueChange={(value) => setIssueTitle(value)}
                      />
                    </Stack>
                    :
                    <>
                      <Text style={cls`text-white text-3xl`}>{currentParams.repository}</Text>
                      <Text style={cls`text-2xl text-white`}>{issueTitle}</Text>
                    </>
                  }
                  <IconButton
                    icon="md-create"
                    onPress={() => {
                      setEditionIssue(!editionIssue)
                      editionIssue ? submit() : false
                    }}
                  ></IconButton>
                </Stack>
                <Stack horizontal style={cls`w-full h-px bg-white`}></Stack>
              </Card.Title>

              {/* BODY  */}
              <Card.Content>
                {/* Issue message */}
                <Stack vertical style={cls`flex w-full h-auto  items-center justify-center`}>
                  {editionIssue ?
                    <Stack horizontal style={cls`w-full`}>
                      {/* Todo : create a textarea */}
                      <Input
                        classes={{ input: `bg-white`, label: `text-white` }}
                        autoFocus
                        label="Nouveau message"
                        value={issueBody}
                        onValueChange={(value) => setIssueBody(value)}
                      />
                    </Stack>
                    :
                    <Text style={cls`p-4 sm:m-0 md:m-4 lg:m-4 xl:m-4 text-lg text-white`}>
                      {issueBody}
                    </Text>
                  }
                  <Stack horizontal style={cls`w-2/3 h-px bg-white justify-center m-8`}></Stack>
                </Stack>

                {/* Comments */}
                <Stack vertical style={cls`flex mb-4 w-full items-end`}>
                  {/* For each comments on the issue */}
                  {currentParams.issue.ticketIssueComments.map((comment, index) => {
                    return (
                      <Stack horizontal key={index} style={cls`flex w-1/3 align-center justify-between sm:m-0 md:m-4 lg:m-4 xl:m-4 p-2 bg-gray-400`}>
                        {editionComment ?
                          <Input
                            classes={{ label: `text-white` }}
                            autoFocus
                            value={commentBody}
                            onValueChange={(value) => { setCommentBody(value) }}
                          />
                          :
                          <Text style={cls``}>
                            {comment.body}
                          </Text>
                        }
                      
                      </Stack>
                    )
                  })}
                  <Stack horizontal style={cls`m8`}></Stack>
                </Stack>

                {/* Add comment */}
         
                  <Stack vertical style={cls`flex items-center`}>
                    <Stack horizontal style={cls`flex-2 w-10/12`}>
                    <Input
                      classes={{ input: `bg-white`, label: `text-white` }}
                      label="Ajouter un commentaire"
                      placeholder={"Ajouter un nouveau commentaire"}
                      value={messageComment}
                      onValueChange={(value) => {
                        clearError()
                         setMessageComment(value)
                        }}
                    >
                    </Input>
                      </Stack>
                    <Stack horizontal style={cls`flex-1 justify-center items-center`}>
                    <Button
                      color={"green-500"}
                      onPress={() => { 
                        sendComment(messageComment)}
                      }
                    >Envoyer
                    </Button>
                      </Stack>
                  </Stack>              
              </Card.Content>
            </Card>
          </View>
        </Stack>
      </Stack>

    </ScrollView>
  );
}
