"use client";

import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div className="h-16 flex sticky top-0 z-50 items-center justify-between px-6 py-4 backdrop-blur-md bg-black bg-opacity-80 text-white container mx-auto">
      <div className="text-xl font-semibold">
        <Link
          href="/"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          MySite
        </Link>
      </div>
      <nav className="space-x-8 text-lg">
        <Link
          href="/"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          Contact
        </Link>
        <Link
          href="/resources"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          Resources
        </Link>
        <Link
          href="/docs"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          Docs
        </Link>
      </nav>
    </div>
  );
}

