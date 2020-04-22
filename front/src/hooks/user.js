import React, { useContext, useState } from "react";
import Api from "../lib/api";
import { userApi, useUserStore } from "../stores/user";

const storedUser = userApi.getState();

const userActions = setUser => ({
  async login({ username, password }) {
    const { results } = await Api.signin({ username, password });
   
    if (results && results.tokens) {
      userApi.setState(results);
      setUser(results);
    } else {
      throw new Error("bad credentials");
    }
  },
  async signup({ username, password }) {
    const { results } = await Api.signup({
      username,
      password
    });
    if (results && results.tokens) {
      userApi.setState(results);
      setUser(results);
    } else {
      throw new Error("bad credentials");
    }
  },
  async updateProfil({ lastname, firstname, company, email, phone}, token) { 
      const { results }  = await Api.updateProfil({
        lastname : lastname,
        firstname : firstname,
        company: company,
        email: email,
        phone: phone
      }, token)// Si j'ajoutais le token ici ? y'a moyen
      
    if(results){    
      userApi.setState(results)
      setUser(results)
    } else {
      throw new Error("Impossible de mettre le profil à jour")
    }
  },

  async createIssue({ label, date, project, body, fileValue}) {   
      const url = await Api.googleIt({
        name: fileValue.name,
        size: fileValue.size,
        uri: fileValue.uri,
      })

      let convertLink
      const regexExt = /\.[a-z]+$/i
      const found = url.results.link.match(regexExt)
      const ext = found[0].substring(1)
      console.log(ext)

      if(ext === "jpeg" || ext === "png" || ext === "jpg"){
        convertLink = `\n ![image](${url.results.link})`
      }else{
        convertLink = `\n ${url.results.link}`
      }
      
    const { results }  = await Api.createIssue({
      title : `${label} - ${date}`,
      body : body + convertLink,
      repositoryName : project,
    })

    if(results){      
      userApi.setState(results)
      setUser(results)
    } else {
      throw new Error("Impossible de créer une nouvelle issue")
    }
  },

  logout() {
    const resetApp = useUserStore(({ resetApp }) => resetApp);
    resetApp();
    setUser(null);
  }
  
});

const UserContext = React.createContext();
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);
  const actions = userActions(setUser);
  return (
    <UserContext.Provider value={{ user, actions }}>
      {children}
    </UserContext.Provider>
  );
};
export function useUser() {
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const logIn = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    await userContext.actions.login({ username, password });
  };
  const signUp = async ({ username, password }) => {
    console.log("USER " + username, password);
    
    setLoading(true);
    setError(null);
    await userContext.actions.signup({
      username,
      password
    });
  };

  const createIssue = async ({ label, date, project, body, fileValue}) => {
    setLoading(true)
    setError(null)
    await userContext.actions.createIssue({
      label,
      date,
      project,
      body,
      fileValue
    })
  }

  const googleIt = async ({fileValue }) => {
    setLoading(true)
    setError(null)
    await userContext.actions.googleIt({
      fileValue
    })
  }

  const updateProfil = async ({ lastname, firstname, company, email, phone }, token) => {
    setLoading(true)
    setError(null)
    await userContext.actions.updateProfil({
      lastname,
      firstname,
      company,
      email,
      phone
    }, token)
  }

  const logOut = () => {
    userContext.actions.logout();
  };
  const getUserToken = () => {
    try {      
      return userContext.user.tokens.token;
    } catch (err) {
      return null;
    }
  };
  return {
    user: userContext.user,
    loggedIn: userContext.user !== null && userContext.user.tokens,
    loading,
    error,
    logIn,
    signUp,
    logOut,
    getUserToken,
    createIssue,
    updateProfil,
    googleIt
  };
}
