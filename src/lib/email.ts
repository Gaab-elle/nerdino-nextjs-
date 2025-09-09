import nodemailer from 'nodemailer'

// Configuração do transporter de email
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Template de email de verificação
export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  const mailOptions = {
    from: `"Nerdino" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verifique seu email - Nerdino',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email - Nerdino</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #6d28d9 0%, #2563eb 100%);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚀 Nerdino</div>
            <h1 class="title">Verifique seu email</h1>
          </div>
          
          <div class="content">
            <p>Olá${name ? ` ${name}` : ''}!</p>
            
            <p>Obrigado por se cadastrar no Nerdino! Para ativar sua conta e começar a usar nossa plataforma, você precisa verificar seu endereço de email.</p>
            
            <p>Clique no botão abaixo para verificar seu email:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este link expira em 24 horas por motivos de segurança.
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${verificationUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>Se você não criou uma conta no Nerdino, pode ignorar este email com segurança.</p>
            <p>© 2024 Nerdino. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}

// Template de email de redefinição de senha
export const sendPasswordResetEmail = async (email: string, token: string, name?: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: `"Nerdino" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Redefinir senha - Nerdino',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Nerdino</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #c2410c 100%);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔒 Nerdino</div>
            <h1 class="title">Redefinir senha</h1>
          </div>
          
          <div class="content">
            <p>Olá${name ? ` ${name}` : ''}!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no Nerdino.</p>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este link expira em 1 hora por motivos de segurança. Se você não solicitou esta redefinição, ignore este email.
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.</p>
            <p>© 2024 Nerdino. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}
