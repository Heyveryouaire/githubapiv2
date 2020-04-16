import React, { useState } from "react";

import { classes as cls, getColor, View, ScrollView } from "tw";
import { useUserStore } from "src/stores/user";

import { Title, Subtitle, Text } from "components/typography";

import LogoutButton from "components/LogoutButton";
import Stack from "components/layout/Stack";
import Avatar from "components/Avatar";
import Navbar from "./parts/Nav";

import Input from "components/form/Input"
import Button from "components/form/Button"

export default function ProfilPage({ navigation }) {
  const token = useUserStore(({ token }) => token);

  const [showSnack, setShowSnack] = useState(false);
  console.log("HomePage -> showSnack", showSnack);

  return (
    <ScrollView
      style={cls`flex-1 w-full h-full`}
      contentContainerStyle={cls`m4 items-center justify-start`}
    >

      <Title>Gestion de compte</Title>
      <Navbar navigation={navigation}></Navbar>

      <View style={cls`w-1/2 bg-white`}>
        <Stack vertical style={cls`w-full`}>
          
          <Title>Nom</Title>
          <Input placeholder="Votre nom"></Input>

          <Title>Prénom</Title>
          <Input placeholder="Votre prénom"></Input>

          <Title>Société</Title>
          <Input placeholder="Votre société"></Input>

          <Title>Adresse e-mail</Title>
          <Input placeholder="Votre e-mail"></Input>

          <Title>Photo de profil</Title>
          <Input placeholder="Ajouter une photo de profil"></Input>

          <Stack horizontal style={cls`w-auto flex-1 items-center justify-around`}>
            <Button>Annuler</Button>
            <Button>Valider</Button>
          </Stack>        
        </Stack>
      </View>
    </ScrollView>
  );
}
