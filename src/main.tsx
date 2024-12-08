import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import PostLoginScreen from "./PostLoginScreen.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import AppRoutes from "./Routes.tsx";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <Authenticator>
          <AppRoutes />
          <PostLoginScreen />
      </Authenticator>
  </React.StrictMode>
);
