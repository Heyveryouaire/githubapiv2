import React from "react";

import { classes as cls} from "tw";

import Stack from "components/layout/Stack";

import Button from "components/form/Button"
import LogoutButton from "components/LogoutButton"
import Link from "../../components/form/Link";

export default function Navbar({ navigation }) {

  return (
    // page home is a model
      <Stack horizontal style={cls`w-full flex-1 items-center justify-start bg-gray-700`}>
        {/* <Button onPress={() => navigation.navigate("home")}>
            Accueil
        </Button> */}
        <Stack horizontal style={cls`w-1/3 flex justify-around items-center`}>

        <Link 
        onPress={() => navigation.navigate("profilPage")}
        classes={{ text: `text-white`}}
        >
        Mon compte
        </Link>

        <Link 
        classes={{ text: `text-white`}}
        onPress={() => navigation.navigate("demandesPage")}
        >
          Mes demandes
        </Link>

        <Link 
        onPress={() => navigation.navigate("ticketPage")}
        classes={{ text: `text-white`}}

        >
          Envoyer un ticket
        </Link>

        <LogoutButton />
        </Stack>

      </Stack>
  );
}
