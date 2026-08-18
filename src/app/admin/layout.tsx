// src/app/admin/layout.tsx
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: 백엔드에 유저 role(또는 isAdmin) 필드 추가되면
  // useMyProfile()로 받아서 role !== 'ADMIN'인 경우 리다이렉트 처리
  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
