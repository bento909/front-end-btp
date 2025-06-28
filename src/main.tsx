import React, {useEffect} from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
// @ts-ignore
import config from "../aws-exports.js";
import '@aws-amplify/ui-react/styles.css';
import AppRoutes from "./Routes.tsx";
import {Provider, useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "./redux/store.tsx";
import { fetchAuthUser } from "./redux/authSlice"
import store from "./redux/store.tsx"

Amplify.configure(config);
Amplify.configure(outputs);

const RootComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchAuthUser());
    }, [dispatch]);

    if (loading) {
        return <div>Loading...</div>; // Show a loading screen while fetching user data
    }

    return <AppRoutes />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <Authenticator hideSignUp={true}>
          <Provider store={store}>
              <RootComponent />
          </ Provider>
      </Authenticator>
  </React.StrictMode>
);
