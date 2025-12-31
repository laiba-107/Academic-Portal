import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Student Academic Portal",
  description: "Admissions, Scholarships, and Mentorship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col bg-background font-sans`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
