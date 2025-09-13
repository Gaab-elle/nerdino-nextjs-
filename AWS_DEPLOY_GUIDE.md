# 🚀 Guia de Deploy AWS - Nerdino NextJS

Este guia contém todas as instruções para fazer deploy do projeto Nerdino na AWS.

## 📋 Pré-requisitos

- ✅ AWS CLI instalado
- ✅ EB CLI instalado
- ✅ Conta AWS configurada
- ✅ Credenciais AWS configuradas

## 🔧 Configuração Inicial

### 1. Configurar AWS CLI

```bash
aws configure
```

Preencha:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 2. Criar IAM User para Deploy

1. Acesse AWS Console → IAM → Users
2. Create user → `nerdino-deploy-user`
3. Attach policies:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonCognitoPowerUser`
   - `AWSAmplifyFullAccess`
4. Create access key → Programmatic access
5. **GUARDE AS CREDENCIAIS!**

## 🗄️ 1. Criar RDS PostgreSQL

### Via Console AWS:

1. **RDS** → **Create database**
2. **Standard create** → **PostgreSQL**
3. **Template**: Free tier (se disponível)
4. **DB instance class**: `db.t2.micro`
5. **Storage**: 20 GB
6. **Master username**: `nerdino_admin`
7. **Master password**: [senha forte]
8. **VPC**: Default VPC
9. **Public access**: No
10. **VPC security group**: Create new
11. **Database name**: `nerdino_db`

### Configurar Security Group:

1. **EC2** → **Security Groups**
2. Encontre o security group do RDS
3. **Edit inbound rules**:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Security group do Elastic Beanstalk (será criado depois)

### URL de Conexão:

```
postgresql://nerdino_admin:senha@host:5432/nerdino_db
```

## 🪣 2. Criar S3 Bucket

### Via Console AWS:

1. **S3** → **Create bucket**
2. **Bucket name**: `nerdino-uploads-[seu-nome]` (único globalmente)
3. **Region**: `us-east-1`
4. **Block public access**: Manter bloqueado
5. **Bucket Versioning**: Enable

### Configurar CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://seu-dominio.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 🔐 3. Criar Cognito User Pool

### Via Console AWS:

1. **Cognito** → **Manage User Pools** → **Create a user pool**
2. **Step 1 - Configure sign-in experience**:
   - Cognito user pool sign-in options: Email
3. **Step 2 - Configure security requirements**:
   - Password policy: Default
   - MFA: Optional
4. **Step 3 - Configure sign-up experience**:
   - Self-service sign-up: Enable
   - Required attributes: Email
5. **Step 4 - Configure message delivery**:
   - Email: Send email with Cognito
6. **Step 5 - Integrate your app**:
   - User pool name: `nerdino-user-pool`
   - App client name: `nerdino-web-client`
   - Client secret: No (para apps públicos)
7. **Step 6 - Review and create**

### Configurar OAuth Providers:

1. **App integration** → **Domain name**:
   - Domain: `nerdino-auth-[seu-nome]`
2. **App client settings**:
   - Callback URLs: `https://seu-dominio.com/api/auth/callback/github`
   - Sign out URLs: `https://seu-dominio.com`
3. **Identity providers**:
   - Configure GitHub OAuth
   - Configure Google OAuth

## 🚀 4. Deploy Elastic Beanstalk

### Inicializar EB:

```bash
eb init nerdino-app --platform node.js --region us-east-1
```

### Criar Environment:

```bash
eb create nerdino-prod --instance_type t2.micro
```

### Configurar Variáveis de Ambiente:

```bash
eb setenv \
  DATABASE_URL="postgresql://nerdino_admin:senha@host:5432/nerdino_db" \
  S3_BUCKET="nerdino-uploads-[seu-nome]" \
  AWS_REGION="us-east-1" \
  NEXTAUTH_URL="https://seu-dominio.com" \
  NEXTAUTH_SECRET="seu-secret-aqui" \
  GITHUB_CLIENT_ID="seu-github-client-id" \
  GITHUB_CLIENT_SECRET="seu-github-client-secret" \
  GOOGLE_CLIENT_ID="seu-google-client-id" \
  GOOGLE_CLIENT_SECRET="seu-google-client-secret" \
  NODE_ENV="production"
```

### Deploy:

```bash
eb deploy
```

## 🌐 5. Deploy Frontend no Amplify

### Via Console AWS:

1. **Amplify** → **Host web app**
2. **GitHub** → Conectar repositório
3. **Branch**: `main`
4. **Build settings**: Usar `amplify.yml` (já criado)
5. **Deploy**

### Configurar Domínio Customizado:

1. **Domain management** → **Add domain**
2. **Domain name**: `seu-dominio.com`
3. **Configure DNS** → Seguir instruções

## 🔄 6. Configurar CI/CD

### GitHub Secrets:

Adicione no GitHub → Settings → Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AMPLIFY_APP_ID`

### GitHub Actions:

O arquivo `.github/workflows/deploy.yml` já está configurado.

## 🔒 7. Configurar Segurança

### Security Groups:

1. **RDS Security Group**:
   - Allow PostgreSQL (5432) from EB Security Group

2. **EB Security Group**:
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere
   - Allow SSH (22) from seu IP

### IAM Policies:

- Usar princípio do menor privilégio
- Criar policies específicas para cada serviço

## 📊 8. Monitoramento

### CloudWatch:

1. **Logs**: Automático no EB
2. **Métricas**: CPU, Memory, Requests
3. **Alarms**: Configurar alertas

### AWS Budget:

1. **Billing** → **Budgets**
2. **Create budget** → $10/mês
3. **Alertas**: 80% e 100%

## 💰 9. Controle de Custos

### Free Tier:

- **EC2**: 750 horas/mês (t2.micro)
- **RDS**: 750 horas/mês (db.t2.micro)
- **S3**: 5 GB storage
- **Data Transfer**: 1 GB/mês

### Dicas:

- Desligar recursos quando não usar
- Usar t2.micro/t3.micro
- Monitorar uso no Cost Explorer
- Configurar AWS Budget

## 🚨 10. Troubleshooting

### Problemas Comuns:

1. **Deploy falha**:
   - Verificar logs: `eb logs`
   - Verificar variáveis de ambiente
   - Verificar build local

2. **Database connection**:
   - Verificar security groups
   - Verificar DATABASE_URL
   - Verificar RDS status

3. **S3 uploads**:
   - Verificar CORS
   - Verificar bucket permissions
   - Verificar AWS credentials

### Comandos Úteis:

```bash
# Ver status do EB
eb status

# Ver logs
eb logs

# SSH na instância
eb ssh

# Abrir aplicação
eb open

# Listar environments
eb list

# Terminar environment
eb terminate
```

## 📝 Checklist Final

- [ ] RDS PostgreSQL criado e configurado
- [ ] S3 bucket criado com CORS
- [ ] Cognito User Pool configurado
- [ ] Elastic Beanstalk deployado
- [ ] Amplify configurado
- [ ] CI/CD funcionando
- [ ] Domínio customizado
- [ ] HTTPS configurado
- [ ] Monitoramento ativo
- [ ] Budget configurado

## 🎉 Deploy Completo!

Seu projeto Nerdino está rodando na AWS! 🚀

**URLs importantes:**
- **Frontend**: https://seu-dominio.com
- **Backend**: https://seu-eb-url.elasticbeanstalk.com
- **Admin**: AWS Console

**Próximos passos:**
1. Configurar domínio customizado
2. Configurar SSL/HTTPS
3. Configurar monitoramento
4. Otimizar performance
5. Configurar backup automático
