"use client"
import { Calculator, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GridBackgroundDemo } from "./Background"


export default function HomePage() {
  const projects = [
    {
      title: "Assignment-1",
      description: "Numerical Methods Calculator",
      icon: <Calculator className="h-8 w-8" />,
      link: "https://numericalmuqeeth.netlify.app/",

    },
    {
      title: "Assignment-2",
      description: "Gauss-Legendre",
      icon: <X className="h-8 w-8" />,
      link: "https://colab.research.google.com/drive/1Fjh6ierx5yqNAT-6Yf149xfjr4qtezX2?usp=sharing",
    },
    
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar/> */}
      
      <header className=" text-white py-12">
       <GridBackgroundDemo/>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to our Matrix Solver project suite. These tools are designed to help students and professionals
            solve complex matrix problems efficiently. From calculating determinants to finding eigenvalues, our
            projects cover a wide range of matrix operations.
          </p>
        </section>

        <section className="flex justify-center gap-4">
          {projects.map((project, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  {project.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-center">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{project.description}</CardDescription>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={project.link} target="_blank">Go to Project</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>

      <footer className="bg-gray-100 py-6">
        
      </footer>
    </div>
  )
}