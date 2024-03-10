import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { Provider } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INTELLECTUS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(outfit.className, "antialiased min-h-screen pt-16")}>
        <Provider>
          <Navbar />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
