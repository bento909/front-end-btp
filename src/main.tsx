import React, {useEffect} from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import AppRoutes from "./Routes.tsx";
import {Provider, useDispatch} from "react-redux";
import {AppDispatch} from "./redux/store.tsx";
import { fetchAuthUser } from "./redux/authSlice"
import store from "./redux/store.tsx"

Amplify.configure(outputs);

const RootComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchAuthUser()); // Fetch user attributes when the app starts
    }, [dispatch]);

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
