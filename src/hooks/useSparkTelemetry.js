import { useState, useEffect, useCallback } from 'react';
import {
  getStoredGroqKey,
  getStoredGroqModel,
  getStoredAiMode,
  getStoredBackendUrl,
} from '../utils/geminiClient';

export function useSparkTelemetry() {
  const [telemetry, setTelemetry] = useState({
    status: 'checking', // 'groq' | 'backend' | 'offline' | 'checking'
    label: 'spark: checking...',
    color: '#8A8782',
    isOnline: false,
    backendOnline: false,
    directOnline: false,
    activeModel: 'llama-3.3-70b-versatile',
    provider: 'groq',
  });

  const checkTelemetry = useCallback(async () => {
    const groqKey = getStoredGroqKey();
    const groqModel = getStoredGroqModel();
    const aiMode = getStoredAiMode();
    const backendUrl = getStoredBackendUrl();

    // If explicitly set to offline synthesizer
    if (aiMode === 'offline') {
      setTelemetry({
        status: 'offline',
        label: 'spark: offline (synthesizer)',
        color: '#F59E0B',
        isOnline: false,
        backendOnline: false,
        directOnline: false,
        activeModel: groqModel,
        provider: 'groq',
      });
      return;
    }

    let isBackendAlive = false;

    // Check backend health with a 1500ms timeout
    if (aiMode !== 'direct') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(`${backendUrl}/`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          isBackendAlive = true;
        }
      } catch (err) {
        isBackendAlive = false;
      }
    }

    const hasGroqKey = Boolean(groqKey && groqKey.trim().length > 10);

    const formatShortModel = (m) => {
      if (m.includes('3.3-70b')) return 'Llama 3.3 70B';
      if (m.includes('deepseek-r1')) return 'DeepSeek R1 70B';
      if (m.includes('3.1-8b')) return 'Llama 3.1 8B';
      if (m.includes('mixtral')) return 'Mixtral 8x7B';
      if (m.includes('120b')) return 'GPT OSS 120B';
      return m;
    };

    const shortModel = formatShortModel(groqModel);

    if (isBackendAlive && (aiMode === 'backend' || aiMode === 'auto')) {
      setTelemetry({
        status: 'backend',
        label: `spark: backend (${shortModel})`,
        color: '#4AE290', // Luminous green
        isOnline: true,
        backendOnline: true,
        directOnline: hasGroqKey,
        activeModel: groqModel,
        provider: 'groq',
      });
    } else if (hasGroqKey && (aiMode === 'direct' || aiMode === 'auto')) {
      setTelemetry({
        status: 'groq',
        label: `spark: online (Groq // ${shortModel})`,
        color: '#F97316', // Groq vibrant orange
        isOnline: true,
        backendOnline: false,
        directOnline: true,
        activeModel: groqModel,
        provider: 'groq',
      });
    } else {
      setTelemetry({
        status: 'offline',
        label: 'spark: offline (synthesizer)',
        color: '#F59E0B', // Amber
        isOnline: false,
        backendOnline: false,
        directOnline: false,
        activeModel: groqModel,
        provider: 'groq',
      });
    }
  }, []);

  useEffect(() => {
    checkTelemetry();
    const interval = setInterval(checkTelemetry, 8000);
    window.addEventListener('focus', checkTelemetry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkTelemetry);
    };
  }, [checkTelemetry]);

  return { telemetry, refreshTelemetry: checkTelemetry };
}
