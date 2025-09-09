# 🎨 Instruções para Usar Sua Própria Imagem de Logo

## 📁 Como Adicionar Sua Imagem

### 1. Preparar a Imagem
- **Formatos suportados**: PNG, JPG, SVG, WebP
- **Tamanhos recomendados**: 
  - 64x64px (para ícones pequenos)
  - 128x128px (para navbar)
  - 256x256px (para headers)
- **Fundo**: Transparente (PNG) ou branco
- **Qualidade**: Alta resolução para diferentes tamanhos

### 2. Colocar na Pasta Public
```bash
# Coloque sua imagem na pasta public/
public/
├── logo.png          # Logo principal (padrão)
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

## 🎯 Onde o Logo é Usado

### Navbar (Barra de Navegação)
- **Arquivo**: `src/components/layout/Navbar.tsx`
- **Tamanho**: `md` (32x32px)
- **Uso**: `<LogoImage size="md" showText={true} />`

### Dashboard Header
- **Arquivo**: `src/components/dashboard/DashboardHeader.tsx`
- **Tamanho**: `lg` (40x40px)
- **Uso**: `<LogoImage size="lg" showText={true} />`

## 🔧 Personalização Avançada

### Apenas Imagem (Sem Texto)
```tsx
<LogoImage 
  imageSrc="/logo-icon.png"
  showText={false}
  size="md"
/>
```

### Diferentes Tamanhos
```tsx
<LogoImage size="sm" />   // 24x24px
<LogoImage size="md" />   // 32x32px (padrão)
<LogoImage size="lg" />   // 40x40px
<LogoImage size="xl" />   // 48x48px
```

### Imagem Personalizada
```tsx
<LogoImage 
  imageSrc="/meu-logo.png"
  imageAlt="Meu Logo Personalizado"
  size="lg"
  showText={true}
/>
```

## 📱 Responsividade

O logo se adapta automaticamente a diferentes tamanhos de tela:
- **Mobile**: Tamanho menor
- **Tablet**: Tamanho médio
- **Desktop**: Tamanho maior

## 🌙 Dark Mode

O logo funciona automaticamente com dark mode:
- **Texto**: Adapta-se ao tema
- **Imagem**: Mantém suas cores originais
- **Fundo**: Transparente

## 🚀 Próximos Passos

1. **Coloque sua imagem** na pasta `public/`
2. **Renomeie** para `logo.png` (ou use `imageSrc` personalizado)
3. **Teste** em diferentes tamanhos
4. **Ajuste** se necessário

## 📝 Exemplo Completo

```tsx
// Em qualquer componente
import { LogoImage } from '@/components/ui/Logo';

function MeuComponente() {
  return (
    <div>
      {/* Logo padrão */}
      <LogoImage />
      
      {/* Logo personalizado */}
      <LogoImage 
        imageSrc="/meu-logo.png"
        imageAlt="Meu Logo"
        size="lg"
        showText={true}
      />
    </div>
  );
}
```

## 🎨 Dicas de Design

- **Simplicidade**: Logo limpo e claro
- **Escalabilidade**: Funciona em diferentes tamanhos
- **Contraste**: Visível em fundos claros e escuros
- **Consistência**: Mesmo estilo em toda aplicação

---

**Pronto! Agora você pode usar sua própria imagem de logo em toda a aplicação!** 🎉
