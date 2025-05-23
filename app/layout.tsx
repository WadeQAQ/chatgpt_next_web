/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { getServerSideConfig } from "./config/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { Providers } from "./providers";
import UserNav from "./components/user-nav";

export const metadata: Metadata = {
  title: "NextChat",
  description: "Your personal ChatGPT Chat Bot.",
  appleWebApp: {
    title: "NextChat",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverConfig = getServerSideConfig();
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="manifest"
          href="/site.webmanifest"
          crossOrigin="use-credentials"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <Providers session={session}>
          {/* 用户登录状态导航 */}
          <div className="fixed top-2 right-2 z-50">
            <UserNav />
          </div>
          
          {children}
          {serverConfig?.isVercel && (
            <>
              <SpeedInsights />
            </>
          )}
          {serverConfig?.gtmId && (
            <>
              <GoogleTagManager gtmId={serverConfig.gtmId} />
            </>
          )}
          {serverConfig?.gaId && (
            <>
              <GoogleAnalytics gaId={serverConfig.gaId} />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
