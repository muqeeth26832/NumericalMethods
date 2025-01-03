"use client";
import { Calculator, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const projects = [
    {
      title: "Assignment-1",
      description: "Numerical Methods Calculator",
      icon: <Calculator className="h-8 w-8" />,
      // link: "https://numericalmuqeeth.netlify.app/",
      link: "/new",
    },
    {
      title: "Assignment-2",
      description: "Gauss-Legendre",
      icon: <X className="h-8 w-8" />,
      // link: "https://colab.research.google.com/drive/1Fjh6ierx5yqNAT-6Yf149xfjr4qtezX2?usp=sharing",
      link: "/p/f/2",
    },

    {
      title: "Assignment-3",
      description: "IVP and BVP Solver",
      icon: <Calculator className="h-8 w-8" />,
      link: "/p/f/3", // Replace with the actual link for Assignment-3
    },
  ];

  // Updated team of 6
  const team = [
    {
      name: "Md Abdul Muqeeth",
      image: "/images/muqeeth.jpeg", // Replace with actual image URL
      description: "Md Abdul Muqeeth is a passionate developer.",
    },
    {
      name: "Soham Mashetty",
      image: "/images/soham2.jpg", // Replace with actual image URL
      description: "Soham Mashetty is a skilled problem solver.",
    },
    {
      name: "Anushka Aggarwal",
      image: "/images/Anushka.jpg", // Replace with actual image URL
      description: "Anushka Aggarwal is a problem solver and loves coding.",
    },
    {
      name: "Rishikesh Kasi Reddy",
      image: "/images/kasi.png", // Replace with actual image URL
      description:
        "pythonic coder and problem solver, Rishikesh Kasi Reddy",
    },
    {
      name: "Rithwik",
      image: "/images/rithwik.png", // Replace with actual image URL
      description: "developer and problem solver, Rithwik",
    },
    {
      name: "Kamal Koushik",
      image: "/images/kamal.png", // Replace with actual image URL
      description:
        "python expert and problem solver, Kamal Koushik (he can hack you)",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white mt-12">
      <header className="text-white py-12 text-center bg-gray-600">
        <h1 className="text-4xl font-bold">
          Welcome to Our Matrix Solver Project Suite
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
          These tools are designed to help students and professionals solve
          complex matrix problems efficiently. From calculating determinants to
          finding eigenvalues, our projects cover a wide range of matrix
          operations.
        </p>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Projects Section */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-semibold mb-6">Our Projects</h2>
          <div className="flex justify-center gap-6">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="flex flex-col bg-gray-800 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-200">
                    {project.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-center text-white">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    {project.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 transition duration-300"
                  >
                    <Link href={project.link} target="_blank">
                      Go to Project
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center text-white mb-6">
            Meet Our Team
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="flex flex-col items-center bg-gray-800 rounded-lg shadow-lg p-6 w-72 transition-transform transform hover:scale-105"
              >
                <CardHeader className="flex flex-col items-center mb-4">
                  <div
                    className="w-32 h-32 bg-cover bg-center rounded-full mb-4"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />
                  <CardTitle className="text-xl font-bold text-white">
                    {member.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 py-6 text-center text-gray-400">
        {/* Add any footer content if needed */}
      </footer>
    </div>
  );
}
