'use client';

import React from 'react';
import { LogoImage } from './Logo';

/**
 * Exemplo de uso do LogoImage
 * 
 * Para usar sua própria imagem de logo:
 * 1. Coloque sua imagem na pasta /public/
 * 2. Use o componente LogoImage com o caminho da imagem
 * 
 * Formatos suportados: PNG, JPG, SVG, WebP
 * Tamanhos recomendados: 64x64px, 128x128px, 256x256px
 */

export function LogoImageExample() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Exemplos de Logo com Imagem
      </h2>
      
      {/* Exemplo 1: Logo padrão (procura por /logo.png) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Logo Padrão</h3>
        <LogoImage size="md" showText={true} />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Procura por /logo.png na pasta public/
        </p>
      </div>

      {/* Exemplo 2: Logo com imagem personalizada */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Logo Personalizado</h3>
        <LogoImage 
          size="lg" 
          showText={true}
          imageSrc="/sua-imagem.png"
          imageAlt="Seu Logo Personalizado"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use imageSrc para especificar o caminho da sua imagem
        </p>
      </div>

      {/* Exemplo 3: Apenas imagem, sem texto */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Apenas Imagem</h3>
        <LogoImage 
          size="xl" 
          showText={false}
          imageSrc="/logo-icon.png"
          imageAlt="Logo Icon"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          showText=false para mostrar apenas a imagem
        </p>
      </div>

      {/* Exemplo 4: Diferentes tamanhos */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Diferentes Tamanhos</h3>
        <div className="flex items-center space-x-4">
          <LogoImage size="sm" showText={false} />
          <LogoImage size="md" showText={false} />
          <LogoImage size="lg" showText={false} />
          <LogoImage size="xl" showText={false} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          sm, md, lg, xl
        </p>
      </div>
    </div>
  );
}
