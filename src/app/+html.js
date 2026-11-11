import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import config from "../shared/config.js";

/**
 * Custom server-rendered HTML document shell (`src/app/+html.js`): charset,
 * viewport, meta description, and PWA manifest link.
 * @module app/+html
 */

/**
 * Props for {@link HTML}.
 *
 * @typedef {object} HTMLProps
 * @property {import("react").ReactNode} children The app's rendered content injected into `<body>`.
 */

/**
 * Wraps the app's server-rendered document with required HTML metadata.
 *
 * @param {HTMLProps} props - Component props.
 * @returns {JSX.Element} The `<html>` document with head/body metadata nodes attached.
 */
export default function HTML({ children }) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {config.description ? <meta name="description" content={config.description} /> : null}
        <link rel="manifest" href="/manifest.json" />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
