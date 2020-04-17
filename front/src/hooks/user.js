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
  async updateProfil({ nom, prenom, company, email, phone}, token) { 
    console.log("test storedUser ", storedUser);  
    const { results }  = await Api.updateProfil({
      lastname : nom,
      firstname : prenom,
      company: company,
      email: email,
      phone: phone
    }, token)// Si j'ajoutais le token ici ? y'a moyen

    if(results && results.tokens){    
      console.log("hi there");
        
      userApi.setState(results)
      setUser(results)
    } else {
      throw new Error("bad bad bad ")
    }
  },
  

  async createIssue({ label, date, project, body}) {   
    const { results }  = await Api.createIssue({
      // login is add manually for now
      login : "",
      title : `${label} - ${date}`,
      body : body,
      repositoryName : project,
      // token is add manually for now
      token : ""
    })
    // if(results && results.token){
    // Je ne retourne pas de token ....
    // ca doit etre ici que l'erreur sur ticketpage se genere 
    if(results){      
      console.log("ICI CA PASSE FAUT PAS DEC !!")
      userApi.setState(results)
      setUser(results)
    } else {
      throw new Error("bad bad bad ")
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

  const createIssue = async ({ label, date, project, body}) => {
    setLoading(true)
    setError(null)
    await userContext.actions.createIssue({
      label,
      date,
      project,
      body
    })
  }

  const updateProfil = async ({ nom, prenom, company, email, phone }, token) => {
    setLoading(true)
    setError(null)
    await userContext.actions.updateProfil({
      nom,
      prenom,
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
    updateProfil
  };
}
