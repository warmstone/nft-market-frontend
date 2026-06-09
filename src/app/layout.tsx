import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gallery - NFT Market",
  description: "A curated marketplace for digital art and collectibles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#fefdfb",
                color: "#1a1a1a",
                border: "1px solid #e8e2d8",
                fontFamily: "Georgia, serif",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
