import React, { useContext, useState } from "react";
import Api from "../lib/api";
import { userApi, useUserStore } from "../stores/user";

const storedUser = userApi.getState();
const userActions = setUser => ({
  async login({ username, password }) {
    const { results } = await Api.signin({ username, password });
    console.log("result", results);
    
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
  const logOut = () => {
    userContext.actions.logout();
  };
  const getUserToken = () => {
    try {
      console.log("usercontext", userContext);
      
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
    getUserToken
  };
}
