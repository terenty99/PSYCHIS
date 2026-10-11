import React from 'react';

export const MetricContent = ({ data }) => {
  const metric = data.metric || {};

  const hasValue =
    typeof metric.value === 'number' &&
    Number.isFinite(metric.value);

  const formattedValue = hasValue
    ? new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 4,
      }).format(metric.value)
    : 'Нет данных';

  const date = metric.asOf ? new Date(metric.asOf) : null;

  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleString('ru-RU')
      : null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary break-words">
        {data.title || 'Показатель'}
      </h3>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-semibold text-text-primary break-words">
          {formattedValue}
        </span>

        {hasValue && metric.unit && (
          <span className="text-sm text-text-secondary">
            {metric.unit}
          </span>
        )}
      </div>

      <div className="space-y-1 text-xs text-text-secondary">
        <p>
          Источник: {metric.source || 'не указан'}
        </p>

        <p>
          {formattedDate
            ? `Данные на ${formattedDate}`
            : 'Дата данных не указана'}
        </p>
      </div>
    </section>
  );
};