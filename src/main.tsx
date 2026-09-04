import React, {useEffect} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {Amplify} from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import AppRoutes from "./Routes.tsx";
import {Provider, useDispatch, useSelector} from "react-redux";
import store, {AppDispatch, RootState} from "./redux/store.tsx";
import {fetchAuthUser} from "./redux/authSlice"
import {Hub} from "aws-amplify/utils";

Amplify.configure(outputs);

const RootComponent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {loading} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Covers an already-authenticated session on page load (a fresh
        // mount with valid tokens already in storage).
        dispatch(fetchAuthUser());

        // Covers a fresh interactive sign-in through the <Authenticator>
        // (Routes.tsx) within the SAME page load — without this, the effect
        // above never re-runs, so `state.auth.error` stays stuck on the
        // pre-login "not signed in yet" failure forever, even after Cognito
        // auth succeeds. Layout.tsx then shows a permanent "Sign-in error"
        // dead end (found via E2E testing, 2026-09-04 — 100% reproducible on
        // every fresh sign-in, since this fetch had never once been retried
        // after a successful login). This was very likely why the old
        // 3x-reload retry loop existed in the first place — each reload
        // happened to re-run this same effect fresh, accidentally papering
        // over the race by brute force.
        const unsubscribe = Hub.listen("auth", ({payload}) => {
            if (payload.event === "signedIn") {
                dispatch(fetchAuthUser());
            }
        });
        return unsubscribe;
    }, [dispatch]);

    if (loading) {
        return <div>Loading...</div>; // Show a loading screen while fetching user data
    }

    return <AppRoutes/>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <RootComponent/>
        </ Provider>
    </React.StrictMode>
);
