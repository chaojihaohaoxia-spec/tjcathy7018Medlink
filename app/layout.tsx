import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";
import Sidebar from "@/components/layout/Sidebar";
import SupportChat from "@/components/support/SupportChat";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "MedLink",
  description: "Blockchain and AI patient care coordination platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var path = window.location.pathname;
                  var role = window.localStorage.getItem("medlink_role");
                  if (!role && path !== "/role-select") {
                    window.location.replace("/role-select");
                  }
                } catch (error) {}
              })();
            `
          }}
        />
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <Sidebar />
            <main className="min-h-screen pt-16">
              <PageTransition>{children}</PageTransition>
            </main>
            <SupportChat />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
