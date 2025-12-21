import React from "react";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-blue-600 text-white">Production Dashboard</header>
      <main className="p-6">{children}</main>
    </div>
  );
}
