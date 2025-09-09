# GitHub Integration Setup

Este documento explica como configurar a integração com GitHub para sincronização automática de dados.

## 1. Criar GitHub OAuth App

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:
   - **Application name**: Nerdino
   - **Homepage URL**: `http://localhost:3000` (desenvolvimento) ou sua URL de produção
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (desenvolvimento) ou `https://seudominio.com/api/auth/callback/github` (produção)
4. Clique em "Register application"
5. Copie o **Client ID** e **Client Secret**

## 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui
```

## 3. Funcionalidades Implementadas

### ✅ APIs Criadas

- **`/api/github/sync`** - Sincroniza dados do usuário com GitHub
- **`/api/github/stats`** - Busca estatísticas do GitHub
- **`/api/github/repos`** - Lista repositórios do usuário

### ✅ Componentes

- **`GitHubIntegration`** - Componente no dashboard para gerenciar integração
- **`useGitHub`** - Hook React para interagir com APIs do GitHub

### ✅ Serviços

- **`GitHubService`** - Classe para interagir com GitHub API
- **`syncUserFromGitHub`** - Função para sincronizar dados do usuário

## 4. Como Funciona

### Login com GitHub
1. Usuário clica em "Entrar com GitHub"
2. NextAuth redireciona para GitHub OAuth
3. GitHub retorna com código de autorização
4. NextAuth troca código por access token
5. Access token é salvo no banco de dados

### Sincronização de Dados
1. Usuário clica em "Sync" no dashboard
2. Sistema busca dados do GitHub usando access token
3. Atualiza perfil do usuário com dados do GitHub
4. Sincroniza repositórios como projetos
5. Calcula estatísticas (stars, linguagens, etc.)

### Dados Sincronizados

- **Perfil**: Nome, bio, localização, website, avatar
- **Repositórios**: Top 20 repositórios públicos como projetos
- **Estatísticas**: Total de repos, stars, seguidores, linguagens
- **Atividade**: Commits recentes e atividade

## 5. Escopos de Permissão

O GitHub OAuth está configurado com os seguintes escopos:
- `read:user` - Ler dados do usuário
- `user:email` - Acessar email do usuário
- `repo` - Acessar repositórios (públicos e privados)

## 6. Próximos Passos

### Webhook do GitHub (Pendente)
- Implementar webhook para atualizações em tempo real
- Notificar quando novos commits são feitos
- Atualizar estatísticas automaticamente

### Melhorias Futuras
- Sincronização de issues e pull requests
- Análise de linguagens de programação
- Gráficos de atividade
- Integração com GitHub Actions

## 7. Troubleshooting

### Erro: "GitHub not connected"
- Verifique se o usuário fez login com GitHub
- Confirme se as variáveis de ambiente estão corretas
- Verifique se o OAuth App está configurado corretamente

### Erro: "Failed to sync GitHub data"
- Verifique se o access token ainda é válido
- Confirme se os escopos de permissão estão corretos
- Verifique logs do servidor para mais detalhes

### Rate Limiting
- GitHub API tem limite de 5000 requests por hora
- Implementar cache para evitar requests desnecessários
- Usar webhooks para atualizações em tempo real

## 8. Segurança

- Access tokens são armazenados criptografados no banco
- Tokens expiram automaticamente
- Apenas dados públicos são sincronizados por padrão
- Usuário pode revogar acesso a qualquer momento
