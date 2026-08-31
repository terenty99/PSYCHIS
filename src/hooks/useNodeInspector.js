import { useState, useCallback } from 'react';
import { announceToScreenReader } from '../utils/accessibilityHelpers';

export function useNodeInspector(initialNodeId = '0x01') {
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [viewMode, setViewMode] = useState('inspector'); // 'inspector' | 'browser' | 'split'
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://arxiv.org/abs/2307.12008');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationMessage, setInvestigationMessage] = useState('');

  const selectNode = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
    setIsInspectorOpen(true);
    announceToScreenReader(`Inspecting node ${nodeId}`);
  }, []);

  const openBrowserWithUrl = useCallback((url, mode = 'split') => {
    if (url) setBrowserUrl(url);
    setIsBrowserOpen(true);
    setIsInspectorOpen(true);
    setViewMode(mode);
    announceToScreenReader(`Embedded browser opened with ${url} in ${mode} mode`);
  }, []);

  const closeBrowser = useCallback(() => {
    setIsBrowserOpen(false);
    setViewMode('inspector');
  }, []);

  const closeInspector = useCallback(() => {
    setIsInspectorOpen(false);
    if (viewMode === 'split') {
      setViewMode('browser');
    }
  }, [viewMode]);

  const switchViewMode = useCallback((mode) => {
    setViewMode(mode);
    if (mode === 'inspector') {
      setIsInspectorOpen(true);
      setIsBrowserOpen(false);
    } else if (mode === 'browser') {
      setIsBrowserOpen(true);
      setIsInspectorOpen(false);
    } else if (mode === 'split') {
      setIsInspectorOpen(true);
      setIsBrowserOpen(true);
    }
  }, []);

  return {
    selectedNodeId,
    setSelectedNodeId,
    selectNode,
    viewMode,
    setViewMode: switchViewMode,
    isInspectorOpen,
    setIsInspectorOpen,
    isBrowserOpen,
    setIsBrowserOpen,
    browserUrl,
    setBrowserUrl,
    openBrowserWithUrl,
    closeBrowser,
    closeInspector,
    isInvestigating,
    setIsInvestigating,
    investigationMessage,
    setInvestigationMessage,
  };
}

