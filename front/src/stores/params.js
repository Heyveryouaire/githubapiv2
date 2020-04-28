import create from "zustand";
import { immer, persist } from "state/middlewares";

import { reset } from "state/index";

// user store
// TODO: move each store in its own module
const userParams = create(
  persist(
    "params",
    immer(set => ({
      params: null,
      setParams: params =>
        set(state => {
          state.params = params;
        }),
      resetApp: () => {
        set(state => {
          state.params = null;
        });
        reset();
      }
    }))
  )
);

export const useParamsStore = userParams[0];
export const paramsApi = userParams[1];
