"use client"
import { FileText } from "lucide-react"
import React from "react"


export default function Docs() {
//border-2 border-black rounded-full text-black  p-2
    return (
        <div className="absolute right-[2rem] top-0 z-20  ">
            <div className=""><button className="text-black" ><FileText /></button></div>
        </div>
    )
}