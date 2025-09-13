'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGitHub } from '@/hooks/useGitHub';

export const GitHubDebug: React.FC = () => {
  const { isConnected, isLoading, error, syncGitHub, getGitHubStats } = useGitHub();
  const [debugInfo, setDebugInfo] = useState<{
    user?: unknown;
    syncResult?: unknown;
    stats?: unknown;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testSync = async () => {
    try {
      setIsTesting(true);
      console.log('Testing GitHub sync...');
      
      // First check user debug info
      const userDebug = await fetch('/api/debug/user');
      const userData = await userDebug.json();
      console.log('User debug:', userData);
      
      // Test the alternative sync API
      const syncAlt = await fetch('/api/github/sync-alt', { method: 'POST' });
      const syncAltData = await syncAlt.json();
      console.log('Sync Alt result:', syncAltData);
      
      const result = await syncGitHub();
      console.log('Sync result:', result);
      
      const stats = await getGitHubStats();
      console.log('GitHub stats:', stats);
      
      setDebugInfo({
        // userDebug: userData,
        // syncAltResult: syncAltData,
        syncResult: result,
        stats: stats,
        // timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test failed:', error);
      setDebugInfo({
        // error: error instanceof Error ? error.message : 'Unknown error',
        // timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>GitHub Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Status:</strong> {isConnected ? '✅ Conectado' : '❌ Não conectado'}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? '⏳ Sim' : '✅ Não'}
          </div>
          <div>
            <strong>Error:</strong> {error || 'Nenhum'}
          </div>
        </div>

        <Button 
          onClick={testSync} 
          disabled={isTesting || !isConnected}
          className="w-full"
        >
          {isTesting ? 'Testando...' : 'Testar Sincronização'}
        </Button>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
