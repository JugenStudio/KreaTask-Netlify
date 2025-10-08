import { AppSidebar } from "@/components/app-sidebar";
import { Chatbot } from "@/components/chatbot";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { tasks, users, leaderboardData } from "@/lib/data";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = users[0];
  return (
    <LanguageProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={currentUser} />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <Chatbot tasks={tasks} users={users} leaderboardData={leaderboardData} />
      </div>
    </LanguageProvider>
  );
}
