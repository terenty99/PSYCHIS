import React from 'react';
import { Sparkles, ArrowRight, HelpCircle, X } from 'lucide-react';

/**
 * Generates natural, context-aware popular inquiry questions for any node.
 * Accurately disambiguates polysemous entities (e.g. Apple the tech company vs apple the fruit).
 */
export function generateSmartQuestionsForNode(node) {
  if (!node) return [];

  const title = (node.data?.title || node.title || '').trim();
  const category = (node.data?.category || '').toLowerCase();
  const description = (node.data?.description || node.data?.detailedSynthesis || '').toLowerCase();
  const rawInquiries = Array.isArray(node.data?.targetedInquiries)
    ? node.data.targetedInquiries.filter(Boolean)
    : [];

  const cleanTitle = title
    .replace(/^Foundational Principles & Concepts in /i, '')
    .replace(/^Introduction to /i, '')
    .trim();

  // If node already has valid targeted inquiries, use them
  if (rawInquiries.length > 0) {
    return rawInquiries.slice(0, 4);
  }

  const fullText = `${cleanTitle} ${category} ${description}`.toLowerCase();
  const lowerTitle = cleanTitle.toLowerCase();

  // Detect Russian context (by content or user browser preference)
  const isRussian =
    /[а-яА-ЯёЁ]/.test(fullText) ||
    (typeof navigator !== 'undefined' && (navigator.language?.startsWith('ru') || navigator.languages?.some((l) => l.startsWith('ru'))));

  // 1. TECHNOLOGY COMPANIES, BRANDS, ELECTRONICS, CORPORATIONS (e.g. Apple Inc., Google, Tesla, Microsoft, Nvidia)
  const isTechCompany =
    category.includes('company') ||
    category.includes('corporation') ||
    category.includes('tech') ||
    category.includes('brand') ||
    category.includes('business') ||
    category.includes('enterprise') ||
    category.includes('electronics') ||
    category.includes('hardware') ||
    category.includes('silicon') ||
    fullText.includes('steve jobs') ||
    fullText.includes('steve wozniak') ||
    fullText.includes('iphone') ||
    fullText.includes('macbook') ||
    fullText.includes('ipad') ||
    fullText.includes('corporation') ||
    fullText.includes('market cap') ||
    fullText.includes('founded in 197') ||
    (lowerTitle === 'apple' && (fullText.includes('computer') || fullText.includes('jobs') || fullText.includes('tech') || fullText.includes('company') || fullText.includes('device')));

  if (isTechCompany) {
    if (isRussian) {
      return [
        `Главные продукты и экосистема ${cleanTitle}`,
        `Плюсы и минусы устройств ${cleanTitle}`,
        `История создания и роль основателей`,
        `Рыночная капитализация и инновации`,
      ];
    }
    return [
      `Flagship products & ecosystem of ${cleanTitle}`,
      `Pros & cons of ${cleanTitle} devices`,
      `Founding history & key leaders`,
      `Market capitalization & innovations`,
    ];
  }

  // 2. FOOD, FRUITS, VEGETABLES, NUTRITION (Strictly when NOT a tech company!)
  const isFood =
    !isTechCompany && (
      category.includes('food') ||
      category.includes('fruit') ||
      category.includes('botan') ||
      category.includes('culinary') ||
      category.includes('плодов') ||
      category.includes('ягод') ||
      category.includes('овощ') ||
      category.includes('питан') ||
      ((lowerTitle.includes('яблок') || lowerTitle.includes('морков') || lowerTitle.includes('carrot') || lowerTitle.includes('банан') || lowerTitle.includes('banana')) && !fullText.includes('computer') && !fullText.includes('inc'))
    );

  if (isFood) {
    if (isRussian) {
      return [
        `Чем полезно ${cleanTitle}?`,
        `Плюсы и минусы ${cleanTitle}`,
        `Зачем нужно ${cleanTitle} в рационе?`,
        `Вред и противопоказания`,
      ];
    }
    return [
      `Health benefits of ${cleanTitle}`,
      `Pros & cons of ${cleanTitle}`,
      `Why is ${cleanTitle} essential in diet?`,
      `Side effects & precautions`,
    ];
  }

  // 3. SOFTWARE, OS, APPS, AI MODELS (e.g. iOS, Windows, ChatGPT, Linux)
  const isSoftware =
    category.includes('software') ||
    category.includes('operating system') ||
    category.includes('app') ||
    category.includes('ai') ||
    category.includes('algorithm') ||
    fullText.includes('open source') ||
    fullText.includes('operating system') ||
    lowerTitle.includes('ios') ||
    lowerTitle.includes('android') ||
    lowerTitle.includes('windows') ||
    lowerTitle.includes('linux');

  if (isSoftware) {
    if (isRussian) {
      return [
        `Ключевые функции и возможности ${cleanTitle}`,
        `Плюсы и минусы системы`,
        `Как настроить и оптимизировать?`,
        `Сравнение с конкурентами`,
      ];
    }
    return [
      `Key features & capabilities of ${cleanTitle}`,
      `Pros & cons of the system`,
      `How to configure & optimize`,
      `Comparison with alternatives`,
    ];
  }

  // 4. MATHEMATICS, PHYSICS, KINEMATICS, STEM
  const isStem =
    category.includes('math') ||
    category.includes('physics') ||
    category.includes('kinematic') ||
    category.includes('mechanic') ||
    category.includes('transport') ||
    category.includes('topolog') ||
    lowerTitle.includes('уравнен') ||
    lowerTitle.includes('интеграл') ||
    lowerTitle.includes('теорем') ||
    lowerTitle.includes('метод') ||
    lowerTitle.includes('закон') ||
    lowerTitle.includes('формул') ||
    lowerTitle.includes('дифференц') ||
    lowerTitle.includes('equation') ||
    lowerTitle.includes('theorem') ||
    lowerTitle.includes('calculus');

  if (isStem) {
    if (isRussian) {
      return [
        `Основные методы решения`,
        `Где применяется на практике?`,
        `Пошаговые примеры с решением`,
        `Главные свойства и ограничения`,
      ];
    }
    return [
      `Key methods of solving ${cleanTitle}`,
      `Practical engineering applications`,
      `Step-by-step derivation & proofs`,
      `Boundary limits & governing laws`,
    ];
  }

  // 5. CHARACTERS, HISTORICAL FIGURES, BIOGRAPHIES
  const isPerson =
    category.includes('character') ||
    category.includes('person') ||
    category.includes('biograph') ||
    category.includes('actor') ||
    category.includes('dossier') ||
    fullText.includes('born in') ||
    fullText.includes('protagonist');

  if (isPerson) {
    if (isRussian) {
      return [
        `Кто такой ${cleanTitle}?`,
        `Главные достижения и биография`,
        `Интересные факты и наследие`,
        `С кем связан ${cleanTitle}?`,
      ];
    }
    return [
      `Who is ${cleanTitle}?`,
      `Key achievements & life story`,
      `Notable facts and impact`,
      `Core associations & background`,
    ];
  }

  // 6. DEFAULT / GENERAL CONCEPTS
  if (isRussian) {
    return [
      `В чём суть ${cleanTitle}?`,
      `Плюсы и ключевые преимущества`,
      `Для чего нужно?`,
      `Применение на практике`,
    ];
  }

  return [
    `Core principles of ${cleanTitle}`,
    `Key advantages & importance`,
    `Why is it needed & how it works`,
    `Real-world practical examples`,
  ];
}

/**
 * Floating prompt pills rendered directly on the canvas around/below a selected card.
 */
export const NodePromptPills = ({
  node,
  measuredDims = {},
  onSelectPrompt,
  onDismiss,
}) => {
  if (!node || node.hidden || node.type === 'generating_preview' || node.data?.isGenerating) return null;

  const questions = generateSmartQuestionsForNode(node);
  if (!questions || questions.length === 0) return null;

  const dims = measuredDims[node.id] || { width: node.width || 320, height: node.height || 240 };
  const posX = node.position?.x ?? 0;
  const posY = (node.position?.y ?? 0) + (dims.height || 240) + 10;
  const maxWidth = Math.max(dims.width || 320, 360);

  return (
    <div
      className="absolute z-35 pointer-events-auto flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 select-none"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        maxWidth: `${maxWidth}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full flex items-center justify-between mb-0.5 px-1 font-mono text-[9px] font-semibold text-text-muted uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
          <span>RESEARCH PROBES</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-0.5 text-text-muted hover:text-text-primary rounded-full hover:bg-grey-medium/60 transition-colors cursor-pointer"
            title="Скрыть подсказки"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {questions.map((question, idx) => (
        <button
          key={idx}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPrompt?.(question, node.id);
          }}
          className="group bg-white-warm/95 hover:bg-[#2C2825] text-text-primary hover:text-white-pure border border-grey-medium hover:border-[#2C2825] px-2.5 py-1 rounded-full font-sans text-[11px] font-medium shadow-3xs hover:shadow-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 backdrop-blur-xs"
          title={`Исследовать вопрос: "${question}"`}
        >
          <Sparkles className="w-3 h-3 text-amber-600 group-hover:text-amber-400 shrink-0 transition-colors" />
          <span className="leading-tight">{question}</span>
          <ArrowRight className="w-2.5 h-2.5 text-text-muted group-hover:text-white-pure/80 shrink-0 group-hover:translate-x-0.5 transition-all" />
        </button>
      ))}
    </div>
  );
};
