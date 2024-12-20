import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import AppRoutes from "./Routes.tsx";
import Layout from "./Layout.tsx";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <Authenticator>
          <Layout>
              <AppRoutes />
          </Layout>
      </Authenticator>
  </React.StrictMode>
);
