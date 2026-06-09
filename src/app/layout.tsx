import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFT Market",
  description: "Decentralized NFT marketplace with signed orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
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
