import React, { useState } from "react";

import { classes as cls, getColor, View, ScrollView } from "tw";
import { useUserStore } from "src/stores/user";

import { Title, Subtitle, Text } from "components/typography";

import Card from "components/Card"
import Badge from "components/Badge"
import LogoutButton from "components/LogoutButton";
import Stack from "components/layout/Stack";
import Avatar from "components/Avatar";
import Navbar from "./parts/Nav";

import Input from "components/form/Input"
import Button from "components/form/Button"

export default function DemandesPages({ navigation }) {
  const token = useUserStore(({ token }) => token);

  const [showSnack, setShowSnack] = useState(false);
  console.log("HomePage -> showSnack", showSnack);

  return (
    <ScrollView
      style={cls`flex-1 w-full h-full`}
      contentContainerStyle={cls`m4 items-center justify-start`}
    >

      <Title>Statut de mes demandes</Title>
      <Navbar navigation={navigation}></Navbar>

      <View style={cls`w-1/2 bg-white`}>

        <Card direction="vertical">
          <Card.Title>Ticket n1</Card.Title>
          <Card.Content>
            <Stack vertical style={cls`w-full`}>
              <Stack horizontal style={cls`w-full flex-wrap`}>
                <Badge.Info>Info des devs</Badge.Info>
              </Stack>
              <Text>
                Message de mon ticket ... 
              </Text>
              <Stack horizontal style={cls`w-auto flex-1 items-center justify-around`}>
                <Button>Annuler le ticket</Button>
                <Button>Editer le ticket</Button>
              </Stack>
            </Stack>
          </Card.Content>
        </Card>
        <Card direction="vertical">
          <Card.Title>Ticket n2</Card.Title>
          <Card.Content>
            <Stack vertical style={cls`w-full`}>
              <Stack horizontal style={cls`w-full flex-wrap`}>
                <Badge.Success>Correction terminée</Badge.Success>
              </Stack>
              <Text>
                Message de mon ticket ... 
              </Text>
              <Stack horizontal style={cls`w-auto flex-1 items-center justify-around`}>
                <Button>Annuler le ticket</Button>
                <Button>Editer le ticket</Button>
              </Stack>
            </Stack>
          </Card.Content>
        </Card>

      </View>
    </ScrollView>
  );
}
