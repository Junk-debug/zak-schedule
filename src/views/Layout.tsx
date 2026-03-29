import React from "react";
import { loadCSS } from "./css.js";

const baseCSS = loadCSS(import.meta.url, "base.css");
const componentsCSS = loadCSS(import.meta.url, "components.css");

export function Layout({
  title,
  children,
  styles = "",
}: {
  title: string;
  children: React.ReactNode;
  styles?: string;
}) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style
          dangerouslySetInnerHTML={{
            __html: baseCSS + componentsCSS + styles,
          }}
        />
      </head>
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
