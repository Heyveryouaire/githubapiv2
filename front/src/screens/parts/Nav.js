import React from "react";

import { classes as cls} from "tw";

import Stack from "components/layout/Stack";

import Button from "components/form/Button"
import LogoutButton from "components/LogoutButton"

export default function Navbar({ navigation }) {

  return (
    // page home is a model
      <Stack horizontal style={cls`w-1/2 flex-1 items-center justify-around`}>
        {/* <Button onPress={() => navigation.navigate("home")}>
            Accueil
        </Button> */}
        <Button onPress={() => navigation.navigate("profilPage")}>
            Gérer mon compte
        </Button>
        <Button onPress={() => navigation.navigate("demandesPage")}>
          Voir mes demandes
        </Button>
        <Button onPress={() => navigation.navigate("ticketPage")}>
            Se plaindre
        </Button>
        <LogoutButton />
      </Stack>
  );
}
