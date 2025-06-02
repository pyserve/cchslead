"use client";
import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}>
      {children}
    </APIProvider>
  );
}
