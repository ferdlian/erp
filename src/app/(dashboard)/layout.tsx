'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import TopBar from '@/components/ui/TopBar';
import AIChat from '@/components/ui/AIChat';
import { useERPStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const { initializeStore } = useERPStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px] transition-all duration-300">
        <TopBar onToggleChat={() => setChatOpen(!chatOpen)} />
        <main className="p-6 gradient-mesh min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
