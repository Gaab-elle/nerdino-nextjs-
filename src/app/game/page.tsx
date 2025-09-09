'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';
import { LogoImage } from '@/components/ui/Logo';

export default function GamePage() {
  useEffect(() => {
    // Load the game CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/style.css';
    document.head.appendChild(link);

    // Load the game JavaScript
    const script = document.createElement('script');
    script.src = '/output.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the CSS link
      const existingLink = document.querySelector('link[href="/style.css"]');
      if (existingLink) {
        existingLink.remove();
      }
      
      // Remove the script
      const existingScript = document.querySelector('script[src="/output.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Chrome Dino Game - Nerdino</title>
        <meta name="description" content="Jogue o clássico jogo do dinossauro do Chrome" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
        {/* Nerdino Logo - Left Side */}
        <div className="absolute top-8 left-8">
          <div className="scale-150">
            <LogoImage size="2xl" showText={false} />
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
            🦕 Chrome Dino Game
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            Pressione <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">ESPAÇO</kbd> ou clique para pular!
          </p>
          
          {/* Game Canvas Container */}
          <div id="container" className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mx-auto">
            <canvas id="board" className="block"></canvas>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-600 dark:text-gray-400 max-w-md">
          <p className="mb-2">
            <strong>Como jogar:</strong>
          </p>
          <ul className="text-sm space-y-1">
            <li>• Pule sobre os cactos e pássaros</li>
            <li>• A velocidade aumenta com o tempo</li>
            <li>• Tente bater seu recorde!</li>
            <li>• O jogo alterna entre dia e noite</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Voltar ao Nerdino
          </a>
        </div>
      </div>
    </>
  );
}
