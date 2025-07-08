"use client";

import ThreeJsCube from "@/components/ThreeJsCube";
import { Button } from "@/components/ui/button";
import { GithubIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Three.js Background */}
      <ThreeJsCube />

      {/* Content Overlay */}
      <div className="relative -z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
          <Sparkles className="h-20 w-20 mx-auto mb-6 text-white animate-pulse" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Fake Front Page
          </h1>
          <p className="text-white/80 mb-8 text-lg">
            Just vibing with a spinning cube while the real app lives on the preview branch 🎲
          </p>
          <div className="flex gap-4 justify-center items-center">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <Sparkles className="h-5 w-5" />
              Nothing Here
            </Button>
            <Link
              className="rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 hover:bg-white/20 transition-all duration-300 border border-white/20"
              href={"https://github.com/mimoimio/yet-another-openai-wrapper"}
              target="_blank"
            >
              <GithubIcon className="h-6 w-6 text-white hover:text-purple-300 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
