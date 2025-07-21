"use client";

export default function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-2xl p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Movie Details</h1>
        {/* TODO: Show movie details and rating form */}
      </div>
    </main>
  );
}
