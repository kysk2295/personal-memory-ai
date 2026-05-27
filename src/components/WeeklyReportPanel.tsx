import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';
import type { WeeklyReportAggregate } from '../lib/weeklyReport';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatus(status: string): string {
  return `<span class="status status-${escapeHtml(status.replace('/', '-'))}">${escapeHtml(status)}</span>`;
}

function renderCitationReference(memoryId: string): string {
  return `<a href="#evidence-${escapeHtml(memoryId)}" class="citation-ref">[${escapeHtml(memoryId)}]</a>`;
}

function renderAggregate(kind: string, aggregate: WeeklyReportAggregate): string {
  return `<li data-weekly-aggregate-kind="${escapeHtml(kind)}" data-weekly-aggregate-value="${escapeHtml(
    aggregate.value,
  )}">
    <strong>${escapeHtml(aggregate.value)} <span>${aggregate.count}</span></strong>
    <p>${aggregate.supportingMemoryIds.map(renderCitationReference).join(' ')}</p>
  </li>`;
}

export function renderWeeklyReportPanel(layout: InitialAppShellEvidenceLayout): string {
  const report = layout.weeklyReport;
  const topEmotions = report.aggregates.emotions.slice(0, 2);
  const topDecisions = report.aggregates.decisions.slice(0, 2);
  const topProjects = report.aggregates.projects.slice(0, 2);
  const topOutcomes = report.aggregates.outcomes.slice(0, 2);
  const patternInsight = report.patternInsights[0];

  return `<section class="weekly-report-flow product-panel" aria-label="Weekly Report cited memory summary" data-weekly-report-id="${escapeHtml(
    report.id,
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Weekly Report</p>
        <h2>${escapeHtml(report.window.startDate)} to ${escapeHtml(report.window.endDate)}</h2>
      </div>
      ${renderStatus(report.status)}
    </div>
    <p class="section-intro">${escapeHtml(report.totalMemoryRecords.toString())} memories in this private weekly window. Every aggregate below is backed by cited MemoryRecord ids.</p>
    <div class="panel-topline">
      <span>${escapeHtml(report.evidenceLabel)}</span>
      <span>citations <strong>${report.includedMemoryIds.length}</strong></span>
    </div>
    <ul class="weekly-report-aggregate-list" aria-label="Weekly report cited aggregates">
      ${topEmotions.map((aggregate) => renderAggregate('emotions', aggregate)).join('')}
      ${topDecisions.map((aggregate) => renderAggregate('decisions', aggregate)).join('')}
      ${topProjects.map((aggregate) => renderAggregate('projects', aggregate)).join('')}
      ${topOutcomes.map((aggregate) => renderAggregate('outcomes', aggregate)).join('')}
    </ul>
    ${
      patternInsight
        ? `<article class="weekly-report-pattern" data-weekly-pattern-id="${escapeHtml(patternInsight.id)}">
          <div class="panel-topline">
            <span>${escapeHtml(patternInsight.evidenceLabel)}</span>
            <span>confidence <strong>${Math.round(patternInsight.confidence * 100)}%</strong></span>
          </div>
          <h3>${escapeHtml(patternInsight.title)}</h3>
          <p>${escapeHtml(patternInsight.explanation)}</p>
          <p>${patternInsight.supportingMemoryIds.slice(0, 3).map(renderCitationReference).join(' ')}</p>
        </article>`
        : ''
    }
    <article class="insufficient-evidence-state" data-weekly-insufficient-evidence-state="available">
      <strong>Insufficient weekly evidence state</strong>
      <p>Need at least 2 MemoryRecord citations in the weekly window.</p>
    </article>
  </section>`;
}
