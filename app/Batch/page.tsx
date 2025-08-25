import dynamic from "next/dynamic";

const BatchUploader = dynamic(() => import("@/components/BatchUploader"), { ssr: false });

export default function BatchPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 bg-background">
      {/* ใช้ container และ spacing โทนเดียวกับหน้าแรก */}
      <div className="max-w-7xl mx-auto">
        <BatchUploader />
      </div>
    </main>
  );
}
