import React from "react";

import { classes as cls} from "tw";

import Stack from "components/layout/Stack";
import { View, Text} from "react-native"
import LogoutButton from "components/LogoutButton"
import Link from "../../components/form/Link";

export default function Navbar({ navigation }) {

  const links = [
    { 
      uri: "profilPage",
      message : "Mon compte"
    },
    {
      uri: "demandesPage",
      message: "Mes demandes"
    },
    {
      uri: "ticketPage",
      message: "Envoyer un ticket"
    }
  ]

  return (
      <Stack horizontal style={cls`w-full items-center justify-start bg-gray-700`}>
        {links.map((link, index) => {
          return (
            <View style={cls`m-x4`} key={index}>
              <Text style={cls`text-lg`}>
                <Link 
                onPress={() => navigation.navigate(link.uri)}
                classes={{ text: `text-white`}}
                >{ link.message}
                </Link>
              </Text>
            </View>
            )
        }) }
         <View style={cls`m-x4`}>
              <Text style={cls`text-sm`}>
                <LogoutButton />
              </Text>
        </View>
      </Stack>
  )
}
