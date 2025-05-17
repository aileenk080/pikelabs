"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const InferencePage = () => {
  const [script, setScript] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [avatar, setAvatar] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    // Simulate generating video
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Placeholder video URL
    setGeneratedVideo("https://picsum.photos/640/480");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-8">
      <header className="w-full p-6 flex justify-center items-center border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">
          Video Generator Interface
        </h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-2xl">
        <div className="mb-4 w-full">
          <label
            htmlFor="scriptInput"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Enter Script:
          </label>
          <Textarea
            id="scriptInput"
            placeholder="Enter the script for the avatar"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={3} // Specify the number of lines
          />
        </div>

        <div className="mb-4 w-full">
          <label
            htmlFor="avatarSelect"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Select Avatar:
          </label>
          <select
            id="avatarSelect"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          >
            <option value="default">Default Avatar</option>
            <option value="custom">Custom Avatar</option>
            {/* Add more avatars here */}
          </select>
        </div>

        <Button onClick={handleGenerateVideo} disabled={isLoading}>
          {isLoading ? "Generating Video..." : "Generate Video"}
        </Button>

        {generatedVideo && (
          <div className="mt-6 w-full">
            <video
              src={generatedVideo}
              className="w-full h-auto rounded-md shadow-lg"
              controls
            />
          </div>
        )}
      </main>

      <footer className="w-full p-4 text-center text-gray-500 border-t border-gray-200">
        {/* Footer content here */}
      </footer>
    </div>
  );
};

export default InferencePage;
