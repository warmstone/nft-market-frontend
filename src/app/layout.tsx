import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/layout/Providers";
import { wagmiConfig } from "@/lib/wagmi";
import Header from "@/components/layout/Header";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFT Market",
  description: "Decentralized NFT marketplace with signed orders",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR cookie hydration for RainbowKit (prevents modal flash)
  const heads = await headers();
  const initialState = cookieToInitialState(
    wagmiConfig,
    heads.get("cookie")
  );

  return (
    <html lang="en" className="dark">
      <body>
        <Providers initialState={initialState}>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: "#1f2937", color: "#f3f4f6", border: "1px solid #374151" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
