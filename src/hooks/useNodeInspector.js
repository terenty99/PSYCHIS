import { useState, useCallback } from 'react';
import { announceToScreenReader } from '../utils/accessibilityHelpers';

export function useNodeInspector(initialNodeId = '0x01') {
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'inspector' | 'browser' | 'split' | 'drawer'
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('psychis://home');
  const [browserViewTab, setBrowserViewTab] = useState('frame'); // 'frame' | 'reader' | 'images'
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationMessage, setInvestigationMessage] = useState('');

  const selectNode = useCallback((nodeId, shouldOpenInspector = true) => {
    setSelectedNodeId(nodeId);
    if (shouldOpenInspector) {
      setIsInspectorOpen(true);
      announceToScreenReader(`Inspecting node ${nodeId}`);
    }
  }, []);

  const openBrowserWithUrl = useCallback((url, mode = 'browser', viewTab = 'frame') => {
    if (url) setBrowserUrl(url);
    if (viewTab) setBrowserViewTab(viewTab);
    setIsBrowserOpen(true);
    if (mode === 'split') {
      setIsInspectorOpen(true);
    } else {
      setIsInspectorOpen(false);
    }
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
    } else if (mode === 'drawer') {
      setIsBrowserOpen(true);
      setIsInspectorOpen(false);
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
    browserViewTab,
    setBrowserViewTab,
    openBrowserWithUrl,
    closeBrowser,
    closeInspector,
    isInvestigating,
    setIsInvestigating,
    investigationMessage,
    setInvestigationMessage,
  };
}

