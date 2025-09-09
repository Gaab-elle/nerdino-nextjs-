# Logo Components

Este diretório contém diferentes variações do logo da Nerdino para diferentes contextos de uso.

## Componentes Disponíveis

### 1. Logo (Principal)
```tsx
import { Logo } from '@/components/ui/Logo';

// Uso básico
<Logo />

// Com tamanho personalizado
<Logo size="lg" />

// Variantes
<Logo variant="default" />  // Padrão com ícone e texto
<Logo variant="minimal" />  // Apenas ícone
<Logo variant="icon" />     // Ícone com fundo
<Logo variant="text" />     // Apenas texto
<Logo variant="image" />    // Logo com imagem personalizada
```

### 1.1. LogoImage (Para Imagens Personalizadas)
```tsx
import { LogoImage } from '@/components/ui/Logo';

// Logo com imagem padrão (/logo.png)
<LogoImage />

// Logo com imagem personalizada
<LogoImage 
  imageSrc="/sua-imagem.png"
  imageAlt="Seu Logo"
  size="lg"
  showText={true}
/>

// Apenas imagem, sem texto
<LogoImage 
  imageSrc="/logo-icon.png"
  showText={false}
/>
```

### 2. FooterLogo
```tsx
import { FooterLogo } from '@/components/ui/FooterLogo';

// Para uso no footer
<FooterLogo />
```

### 3. LoadingLogo
```tsx
import { LoadingLogo } from '@/components/ui/LoadingLogo';

// Para telas de loading
<LoadingLogo size="lg" animated={true} />
```

### 4. HeroLogo
```tsx
import { HeroLogo } from '@/components/ui/HeroLogo';

// Para hero sections
<HeroLogo animated={true} />
```

## Tamanhos Disponíveis

- `sm`: 24x24px (h-6 w-6)
- `md`: 32x32px (h-8 w-8) - Padrão
- `lg`: 40x40px (h-10 w-10)
- `xl`: 48x48px (h-12 w-12)

## Características

- **Gradiente**: Azul para roxo (#3B82F6 → #8B5CF6)
- **Ícone**: Code2 do Lucide React
- **Sparkle**: Elemento decorativo amarelo
- **Responsivo**: Adapta-se a diferentes tamanhos
- **Dark Mode**: Suporte completo
- **Animações**: Opcionais para loading states

## Como Usar Sua Própria Imagem de Logo

### 1. Preparar a Imagem
- **Formatos suportados**: PNG, JPG, SVG, WebP
- **Tamanhos recomendados**: 64x64px, 128x128px, 256x256px
- **Fundo**: Transparente (PNG) ou branco
- **Qualidade**: Alta resolução para diferentes tamanhos

### 2. Colocar a Imagem
```bash
# Coloque sua imagem na pasta public/
public/
├── logo.png          # Logo principal
├── logo-icon.png     # Logo apenas ícone
└── sua-imagem.png    # Sua imagem personalizada
```

### 3. Usar no Código
```tsx
// Logo padrão (procura por /logo.png)
<LogoImage />

// Logo personalizado
<LogoImage 
  imageSrc="/sua-imagem.png"
  imageAlt="Seu Logo"
  size="lg"
  showText={true}
/>
```

## Uso Recomendado

- **Navbar**: `LogoImage` com tamanho `md`
- **Dashboard**: `LogoImage` com tamanho `lg`
- **Footer**: `FooterLogo` ou `LogoImage`
- **Loading**: `LoadingLogo` com animação
- **Hero**: `HeroLogo` com animação
- **Favicon**: SVG personalizado em `/public/favicon.svg`
