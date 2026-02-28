// src/features/tests/config/testsSummary.config.js

import { summaryPage, summarySections } from '../../../shared/summaries2'

// Sekcje domenowe (na razie zostają w features — framework-only)
import KPIs from '../components/TestsSummary/KPIs'
import MethodsTable from '../components/TestsSummary/MethodsTable'
import MixOverview from '../components/TestsSummary/MixOverview'
import ClientTime from '../components/TestsSummary/ClientTime'
import ClientsByMethods from '../components/TestsSummary/ClientsByMethods'
import TopMethods from '../components/TestsSummary/TopMethods'
import StdMethodAnalysis from '../components/TestsSummary/StdMethodAnalysis'

export function buildTestsSummaryConfig(ctx) {
  return summaryPage.summaryPage('tests-summary ts-page es-root', [
    summarySections.kpiSection('kpis', KPIs, { totals: ctx.totals, fmtPLN: ctx.fmtPLN }),

    summarySections.tableSection('methods-table', MethodsTable, {
      rows: ctx.rows,
      tableRows: ctx.filteredMethods,
      filter: ctx.filter,
      setFilter: ctx.setFilter,
      accrFilter: ctx.accrFilter,
      setAccrFilter: ctx.setAccrFilter,
      sortField: ctx.sortField,
      setSortField: ctx.setSortField,
      sortAsc: ctx.sortAsc,
      setSortAsc: ctx.setSortAsc,
      mPage: ctx.mPage,
      setMPage: ctx.setMPage,
      mPageSize: ctx.mPageSize,
      setMPageSize: ctx.setMPageSize,
      fmtPLN: ctx.fmtPLN,
    }),

    summarySections.chartSection('mix-overview', MixOverview, { series: ctx.series, methodKey: ctx.methodKey }),
    summarySections.chartSection('client-time', ClientTime, { series: ctx.series, methodKey: ctx.methodKey }),
    summarySections.chartSection('clients-by-methods', ClientsByMethods, { series: ctx.series, methodKey: ctx.methodKey }),

    summarySections.chartSection('top-methods', TopMethods, {
      series: ctx.series,
      rows: ctx.rows,
      methodKey: ctx.methodKey,
      idByMethodNo: ctx.idByMethodNo,
    }),

    summarySections.chartSection('std-method-analysis', StdMethodAnalysis, {
      series: ctx.series,
      rows: ctx.rows,
      methodById: ctx.methodById,
    }),
  ])
}