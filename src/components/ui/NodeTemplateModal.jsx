import React, { useState } from 'react';
import { X, Plus, Sparkles, Globe, Activity, BarChart2, Compass, AlertOctagon } from 'lucide-react';
import { NODE_TEMPLATES } from '../../utils/nodeTemplates';

export const NodeTemplateModal = ({ isOpen, onClose, onCreateNode }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('mechanism');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const templateIcons = {
    website: Globe,
    mechanism: Activity,
    transport: BarChart2,
    topological: Compass,
    contradiction: AlertOctagon,
    spawned: Sparkles,
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const template = NODE_TEMPLATES[selectedTemplate];
    onCreateNode({
      templateKey: selectedTemplate,
      customData: {
        title: title.trim() || template.defaultData.title,
        description: description.trim() || template.defaultData.description,
      },
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-[#3A3530]/20 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white-pure border border-grey-strong rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-w-[540px] w-full text-text-primary"
        role="dialog"
        aria-label="Create new spatial node"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-grey-medium">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-text-secondary" />
            <h2 className="font-display text-base font-semibold text-text-primary">
              Spawn Node From Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-contemplative !w-7 !h-7 !p-0 rounded-lg text-xs"
            aria-label="Close template modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Selector Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 font-mono text-xs">
          {Object.entries(NODE_TEMPLATES).map(([key, tmpl]) => {
            const Icon = templateIcons[key] || Sparkles;
            const isSelected = selectedTemplate === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedTemplate(key);
                  setTitle(tmpl.defaultData.title);
                  setDescription(tmpl.defaultData.description);
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white-warm border-text-primary shadow-xs ring-2 ring-text-primary/10'
                    : 'bg-grey-soft/70 border-grey-medium hover:bg-grey-medium/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-text-primary' : 'text-text-muted'}`} />
                  <span className="text-[9px] text-text-muted capitalize">{key}</span>
                </div>
                <div className="font-sans font-medium text-[12px] text-text-primary line-clamp-1">
                  {tmpl.defaultData.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCreate} className="space-y-3 font-sans">
          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-secondary mb-1">
              CONCEPT / THEOREM TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Non-linear Cryogenic Linkage"
              className="w-full bg-white-warm border border-grey-medium rounded-xl p-2.5 px-3 text-xs text-text-primary outline-none focus:border-text-primary select-text"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-secondary mb-1">
              SYNTHESIS / ABSTRACT
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter brief description or kinematic formula..."
              className="w-full bg-white-warm border border-grey-medium rounded-xl p-2.5 px-3 text-xs text-text-primary outline-none focus:border-text-primary select-text resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-grey-soft font-mono">
            <button
              type="button"
              onClick={onClose}
              className="btn-contemplative text-xs !py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-contemplative btn-primary-contemplative text-xs !py-2 px-5 font-semibold"
            >
              Spawn Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
