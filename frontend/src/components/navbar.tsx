"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="h-16 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black bg-opacity-80 text-white fixed top-0 left-0 w-full z-50">
      <div className="text-xl font-semibold">
        <Link
          href="/"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          MySite
        </Link>
      </div>
      
      {/* Desktop Menu */}
      <nav className="hidden lg:flex space-x-8 text-lg">
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
          href="/posts"
          className="text-blue-400 dark:hover:text-blue-500 hover:underline"
        >
          Docs
        </Link>
      </nav>
      
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center">
        <button onClick={toggleMenu} className="text-white">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-80 text-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-blue-400 dark:hover:text-blue-500 hover:underline"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-blue-400 dark:hover:text-blue-500 hover:underline"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-blue-400 dark:hover:text-blue-500 hover:underline"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link
              href="/resources"
              className="text-blue-400 dark:hover:text-blue-500 hover:underline"
              onClick={toggleMenu}
            >
              Resources
            </Link>
            <Link
              href="/docs"
              className="text-blue-400 dark:hover:text-blue-500 hover:underline"
              onClick={toggleMenu}
            >
              Docs
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}


