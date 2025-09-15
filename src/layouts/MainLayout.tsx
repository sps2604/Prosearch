import React from "react";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="w-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
