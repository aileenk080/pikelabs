"use client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-gray-600 text-2xl">
          Welcome to Suitify!
        </p>
      </div>

      <footer className="w-full p-4 text-center text-gray-500 border-t border-gray-200 mt-auto">
        {/* Footer content here */}
      </footer>
    </div>
  );
}
