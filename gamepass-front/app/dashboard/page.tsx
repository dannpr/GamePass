"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import esport from "@/public/esport.png";
import { CircularProgress } from "@nextui-org/react";

export default function Dashboard() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true); // Afficher le contenu après quelques secondes
    }, 3000); // Délai en millisecondes

    return () => clearTimeout(timer); // Nettoyer le timer lors du démontage du composant
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <w3m-button />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold m-8">Game Pass</h1>
        <div className="flex mb-24">
          {!showContent && <CircularProgress color="secondary" aria-label="Loading..." />} {/* Afficher CircularProgress tant que showContent est false */}
          {showContent && (
            <>
              <Image src={esport} alt={"Esport picture"} className="w-1/2 rounded-3xl" />
              <div className="flex flex-col justify-center m-6">
                <h2 className="text-xl my-2">Amount</h2>
                <p className="text-xl my-2">$60</p>
                <h2 className="text-xl my-2">Pool Prize</h2>
                <p className="text-xl my-2">$1000</p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
