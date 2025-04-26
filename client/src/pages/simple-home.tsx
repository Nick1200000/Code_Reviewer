import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SimpleHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="block">Code Review</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-100">
                Application
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
              AI-powered code analysis at your fingertips.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}