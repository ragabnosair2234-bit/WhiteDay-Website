import { trpc } from "@/providers/trpc";

export default function Home() {
  const { data: ping } = trpc.ping.useQuery();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-8">
      <h1 className="text-4xl font-bold mb-4 text-rose-900">
        WHITE DAY Wedding Planner
      </h1>
      <p className="text-neutral-600 mb-8 text-center max-w-md">
        Backend API is running. Frontend developer can start building here.
      </p>

      <div className="bg-white rounded-lg shadow-sm border p-6 w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">API Status</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Backend connected</span>
          <span className="text-neutral-400 ml-2">
            {ping ? `Ping: ${ping.ts}` : "Loading..."}
          </span>
        </div>
      </div>

      <div className="mt-8 text-sm text-neutral-400">
        Available API routers: auth, user, service, booking, payment, review, dispute
      </div>
    </div>
  );
}
