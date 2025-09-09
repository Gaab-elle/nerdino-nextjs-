'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verificado com sucesso!');
        setUserEmail(data.user.email);
      } else {
        if (data.error.includes('expired')) {
          setStatus('expired');
          setMessage('Token expirado. Solicite um novo email de verificação.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao verificar email.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente.');
    }
  };

  const resendVerification = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (response.ok) {
        setMessage('Novo email de verificação enviado!');
      } else {
        setMessage('Erro ao enviar email. Tente novamente.');
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {status === 'loading' && 'Verificando email...'}
            {status === 'success' && 'Email Verificado!'}
            {status === 'error' && 'Erro na Verificação'}
            {status === 'expired' && 'Token Expirado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className={`text-sm ${getStatusColor()} mb-6`}>
            {message}
          </p>

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sua conta foi verificada com sucesso! Agora você pode fazer login e usar todas as funcionalidades da plataforma.
              </p>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                O link de verificação expirou. Clique no botão abaixo para receber um novo email.
              </p>
              <Button 
                onClick={resendVerification}
                variant="outline"
                className="w-full"
              >
                Reenviar Email
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                variant="ghost"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ocorreu um erro ao verificar seu email. Verifique se o link está correto ou solicite um novo email.
              </p>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aguarde enquanto verificamos seu email...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
