/*
This file is updated to reflect the new font choice for the kinetic typography theme.
- The preconnect link for Google Fonts is updated. The previous font `Space Mono` is removed.
- `suppressHydrationWarning` is added to the <html> tag, which is a recommended practice when using next-themes to avoid class name mismatch errors between server and client.
- Body class is simplified, as font styles are now handled in globals.css and tailwind.config.js.
*/
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* The new 'Inter' font is imported directly in globals.css */}
      </Head>
      <body className="bg-background text-foreground antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}