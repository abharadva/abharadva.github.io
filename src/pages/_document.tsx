
/*
This file is updated to reflect the new font choice for the neo-brutalist theme.
- The preconnect link for Google Fonts is updated for 'Space Mono'.
- The Inter font is removed.
- Body class is updated to apply the `font-mono` class globally.
- `suppressHydrationWarning` is added for compatibility with next-themes.
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-background text-black antialiased font-mono">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}