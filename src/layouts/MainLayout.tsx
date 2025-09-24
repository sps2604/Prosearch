import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
type MainLayoutProps = {
  children: React.ReactNode;
};
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900">
          <main className="flex-1">{children}</main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
