import "./globals.css";

import { Metadata } from "next";

import { RootProvider } from "@/components/layout/root-provider";

export const metadata: Metadata = {
  title: "SL Passport Portal · Admin Console",
  description: "IOM Frontend Admin Panel",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
