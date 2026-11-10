import { useEffect } from "react";
import Head from "expo-router/head";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import config from "../shared/config.js";

import "../stylesheets/global.css";

/**
 * Root layout route (`src/app/_layout.js`): loads the Outfit variable font,
 * registers the service worker, sets the document title, and renders the Stack navigator.
 * @module app/_layout
 */

/**
 * Root navigator layout shared by every route.
 *
 * @returns {JSX.Element|null} The Stack navigator once fonts are loaded; otherwise, nothing.
 */
export default function Layout() {
  const [loaded] = useFonts({
    Outfit: require("../../ttf/Outfit-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        console.warn("Service Worker registration failed");
      });
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{config.title}</title>
      </Head>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
