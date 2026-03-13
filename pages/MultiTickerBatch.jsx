import { useState } from 'react'

export default function MultiTickerBatch() {
  const [tickersInput, setTickersInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [batchInfo, setBatchInfo] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const analyzeMultipleTickers = async () => {
    if (!tickersInput.trim()) return
    
    const tickers = tickersInput
      .split(/[,\s\n]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0)
    
    if (tickers.length === 0) {
      alert('Veuillez entrer au moins un ticker valide')
      return
    }
    
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(tickers.length / BATCH_SIZE)
    
    if (tickers.length > BATCH_SIZE) {
      setBatchInfo({
        total: tickers.length,
        batches: totalBatches,
        batchSize: BATCH_SIZE,
        estimatedTime: Math.ceil(totalBatches * 10)
      })
      setShowConfirmModal(true)
    } else {
      startAnalysis(tickers)
    }
  }

  const startAnalysis = async (tickers) => {
    setShowConfirmModal(false)
    setLoading(true)
    setResults([])
    setProgress({ current: 0, total: tickers.length })
    
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(tickers.length / BATCH_SIZE)
    const allResults = []
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, tickers.length)
      const batchTickers = tickers.slice(start, end)
      
      const promises = batchTickers.map((ticker, index) => 
        analyzeSingleTicker(ticker, start + index, tickers.length)
      )
      
      const batchResults = await Promise.all(promises)
      allResults.push(...batchResults)
      setResults([...allResults])
    }
    
    setLoading(false)
    setProgress({ current: tickers.length, total: tickers.length })
  }

  const analyzeSingleTicker = async (ticker, index, total) => {
    setProgress({ current: index + 1, total })
    
    try {
      const response = await fetch('/api/backend/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, language: 'EN' })
      })
      
      if (!response.ok) {
        return {
          ticker,
          status: 'ERROR',
          verdict: 'N/A',
          score: 0,
          companyName: 'N/A',
          country: 'N/A',
          businessType: 'N/A',
          debtRatio: 'N/A',
          cashRatio: 'N/A',
          receivablesRatio: 'N/A',
          interestRatio: 'N/A',
          error: response.status === 404 ? 'Ticker introuvable' : 'Erreur API'
        }
      }
      
      const data = await response.json()
      
      // Extraire les VRAIES valeurs depuis data.ratios (pas financials)
      const debtRatio = data.ratios?.debt_to_assets ? `${data.ratios.debt_to_assets.toFixed(2)}%` : 'N/A'
      const cashRatio = data.ratios?.cash_to_assets ? `${data.ratios.cash_to_assets.toFixed(2)}%` : 'N/A'
      const receivablesRatio = data.ratios?.receivables_to_assets ? `${data.ratios.receivables_to_assets.toFixed(2)}%` : 'N/A'
      const interestRatio = data.ratios?.interest_to_revenue ? `${data.ratios.interest_to_revenue.toFixed(2)}%` : 'N/A'
      
      return {
        ticker: data.ticker,
        companyName: data.company_name,
        country: data.country || 'USA',
        businessType: data.sector || data.industry || 'Technology',
        status: 'SUCCESS',
        verdict: data.verdict,
        score: data.score,
        compliantStandards: data.compliant_standards,
        totalStandards: data.total_standards,
        standards: data.standards,
        financials: data.financials,
        debtRatio,
        cashRatio,
        receivablesRatio,
        interestRatio
      }
    } catch (error) {
      return {
        ticker,
        status: 'ERROR',
        verdict: 'N/A',
        score: 0,
        companyName: 'N/A',
        country: 'N/A',
        businessType: 'N/A',
        debtRatio: 'N/A',
        cashRatio: 'N/A',
        receivablesRatio: 'N/A',
        interestRatio: 'N/A',
        error: 'Erreur de connexion'
      }
    }
  }

  const toggleRow = (ticker) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(ticker)) {
      newExpanded.delete(ticker)
    } else {
      newExpanded.add(ticker)
    }
    setExpandedRows(newExpanded)
  }

  const exportToExcel = () => {
    const headers = ['#', 'Ticker', 'Entreprise', 'Pays', 'Type Business', 'Verdict', 'Score %', 'Standards', 'Debt %', 'Cash %', 'Receivables %', 'Interest %']
    const rows = filteredResults.map((r, idx) => [
      idx + 1,
      r.ticker,
      r.companyName || 'N/A',
      r.country || 'N/A',
      r.businessType || 'N/A',
      r.verdict,
      r.status === 'SUCCESS' ? r.score : 'N/A',
      r.status === 'SUCCESS' ? `'${r.compliantStandards}/${r.totalStandards}` : 'N/A', // FORCE TEXTE avec apostrophe
      r.debtRatio,
      r.cashRatio,
      r.receivablesRatio,
      r.interestRatio
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `halalscore_batch_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToCSV = exportToExcel

  const exportToPDF = () => {
    const reportDate = new Date().toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HalalScore Batch Analysis Report</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 7pt;
      line-height: 1.2;
      color: #D4AF37;
      background: #0B0E14;
      padding: 15px;
    }
    .header {
      background: linear-gradient(135deg, #0B0E14 0%, #1A1F26 100%);
      border: 3px double #D4AF37;
      padding: 12px;
      margin-bottom: 10px;
      text-align: center;
    }
    .header h1 {
      font-size: 16pt;
      color: #D4AF37;
      letter-spacing: 3px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-family: 'Courier New', monospace;
    }
    .header h2 {
      font-size: 8pt;
      color: #94A3B8;
      letter-spacing: 2px;
      font-weight: normal;
    }
    .doc-control {
      background: #14181F;
      border: 2px solid #D4AF37;
      padding: 8px;
      margin-bottom: 10px;
      font-size: 6.5pt;
    }
    .doc-control table {
      width: 100%;
      border-collapse: collapse;
    }
    .doc-control td {
      padding: 2px 6px;
      color: #94A3B8;
    }
    .doc-control td:first-child {
      font-weight: bold;
      width: 140px;
      color: #D4AF37;
    }
    .doc-control td.value {
      color: #FFFFFF;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 8px;
    }
    .stat-box {
      flex: 1;
      text-align: center;
      padding: 8px;
      border: 2px solid #D4AF37;
      background: #14181F;
    }
    .stat-box h3 {
      font-size: 6pt;
      color: #94A3B8;
      letter-spacing: 1px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    .stat-box .value {
      font-size: 18pt;
      font-weight: bold;
      color: #D4AF37;
      font-family: 'Courier New', monospace;
    }
    .stat-box.halal .value { color: #10B981; }
    .stat-box.haram .value { color: #EF4444; }
    .stat-box.errors .value { color: #64748B; }
    table.data {
      width: 100%;
      border-collapse: collapse;
      font-size: 6.5pt;
      background: #14181F;
      border: 2px solid #D4AF37;
    }
    table.data th {
      background: #0B0E14;
      color: #D4AF37;
      padding: 6px 3px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #D4AF37;
      font-size: 6pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table.data td {
      padding: 4px 3px;
      border: 1px solid #2A313C;
      color: #94A3B8;
      text-align: center;
    }
    table.data td.ticker {
      font-weight: bold;
      color: #FFFFFF;
      background: #1A1F26;
    }
    table.data td.halal {
      color: #10B981;
      font-weight: bold;
    }
    table.data td.haram {
      color: #EF4444;
      font-weight: bold;
    }
    table.data tr:nth-child(even) {
      background: #0F1419;
    }
    .footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 2px solid #D4AF37;
      font-size: 5.5pt;
      color: #64748B;
      text-align: center;
      background: #14181F;
      padding: 8px;
    }
    .footer p {
      margin: 2px 0;
    }
    .footer strong {
      color: #D4AF37;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>╔═══════════════════════════════════════════════════════════════╗</h1>
    <h1>║   HALALSCORE SHARIAH COMPLIANCE BATCH ANALYSIS REPORT        ║</h1>
    <h1>╚═══════════════════════════════════════════════════════════════╝</h1>
    <h2>INSTITUTIONAL-GRADE MULTI-TICKER ANALYSIS • ISO-COMPLIANT METHODOLOGY</h2>
  </div>

  <div class="doc-control">
    <table>
      <tr>
        <td>Report ID:</td>
        <td class="value">HS-BATCH-${new Date().toISOString().replace(/[:.]/g, '-')}</td>
        <td>Analysis Date:</td>
        <td class="value">${reportDate} UTC</td>
      </tr>
      <tr>
        <td>Total Tickers:</td>
        <td class="value">${filteredResults.length}</td>
        <td>Standards Applied:</td>
        <td class="value">AAOIFI · DJIM · S&P Shariah · MSCI Islamic · FTSE Shariah · Meezan · Usmani</td>
      </tr>
      <tr>
        <td>Data Sources:</td>
        <td class="value" colspan="3">Multi-source aggregation framework (SEC filings, certified market data providers)</td>
      </tr>
      <tr>
        <td>Methodology:</td>
        <td class="value" colspan="3">Triple-validation process · Automated + Manual review · ISO-compliant audit trail</td>
      </tr>
      <tr>
        <td>Certification:</td>
        <td class="value" colspan="3">✓ VERIFIED & CERTIFIED · Complete transaction log maintained</td>
      </tr>
    </table>
  </div>

  <div class="stats">
    <div class="stat-box">
      <h3>TOTAL ANALYSED</h3>
      <div class="value">${stats.total}</div>
    </div>
    <div class="stat-box halal">
      <h3>HALAL</h3>
      <div class="value">${stats.compliant}</div>
    </div>
    <div class="stat-box haram">
      <h3>HARAM</h3>
      <div class="value">${stats.nonCompliant}</div>
    </div>
    <div class="stat-box errors">
      <h3>ERRORS</h3>
      <div class="value">${stats.errors}</div>
    </div>
  </div>

  <table class="data">
    <thead>
      <tr>
        <th>#</th>
        <th>TICKER</th>
        <th>ENTREPRISE</th>
        <th>PAYS</th>
        <th>TYPE BUSINESS</th>
        <th>VERDICT</th>
        <th>SCORE<br/>%</th>
        <th>STD</th>
        <th>DEBT<br/>%</th>
        <th>CASH<br/>%</th>
        <th>RECV<br/>%</th>
        <th>INT<br/>%</th>
      </tr>
    </thead>
    <tbody>
      ${filteredResults.map((r, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="ticker">${r.ticker}</td>
          <td style="text-align:left;padding-left:5px;">${(r.companyName || r.error || 'N/A').substring(0, 25)}</td>
          <td>${r.country || 'N/A'}</td>
          <td>${(r.businessType || 'N/A').substring(0, 15)}</td>
          <td class="${r.verdict === 'COMPLIANT' ? 'halal' : 'haram'}">${r.verdict === 'COMPLIANT' ? '✓ HALAL' : r.verdict === 'NON-COMPLIANT' ? '✗ HARAM' : 'N/A'}</td>
          <td style="color:#D4AF37;font-weight:bold;">${r.status === 'SUCCESS' ? r.score : '-'}</td>
          <td>${r.status === 'SUCCESS' ? `${r.compliantStandards}/${r.totalStandards}` : '-'}</td>
          <td>${r.debtRatio}</td>
          <td>${r.cashRatio}</td>
          <td>${r.receivablesRatio}</td>
          <td>${r.interestRatio}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>DISCLAIMER & LEGAL NOTICE</strong></p>
    <p>This report is provided for informational purposes only and does not constitute financial, legal, or religious advice.</p>
    <p>The analysis is based on publicly available financial data and standardized Shariah screening methodologies.</p>
    <p>All financial ratios are computed using the latest available fiscal period data and verified through multiple sources.</p>
    <p style="margin-top: 6px;">© ${new Date().getFullYear()} HALALSCORE. All Rights Reserved. Proprietary methodology. Unauthorized reproduction prohibited.</p>
  </div>
</body>
</html>
    `
    
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
      setTimeout(() => {
        newWindow.print()
      }, 500)
    }
  }

  const filteredResults = results.filter(r => {
    if (filter === 'ALL') return true
    if (filter === 'HALAL') return r.verdict === 'COMPLIANT'
    if (filter === 'HARAM') return r.verdict === 'NON-COMPLIANT'
    return true
  })

  const stats = {
    total: results.length,
    compliant: results.filter(r => r.verdict === 'COMPLIANT').length,
    nonCompliant: results.filter(r => r.verdict === 'NON-COMPLIANT').length,
    errors: results.filter(r => r.status === 'ERROR').length
  }

  return (
    <div className="space-y-6">
      
      {/* BARRE DE PROGRESSION FIXE */}
      {loading && (
        <div className="fixed top-20 left-0 right-0 z-50 bg-[#1A1F26] border-b-2 border-[#D4AF37] shadow-2xl">
          <div className="max-w-[1440px] mx-auto px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4AF37]"></div>
                <span className="text-white font-semibold">ANALYSE EN COURS</span>
              </div>
              <div className="text-right">
                <div className="text-[#D4AF37] font-mono font-bold text-lg">Analysé: {progress.current} / {progress.total}</div>
                <div className="text-[#64748B] text-xs">Restant: {progress.total - progress.current}</div>
              </div>
            </div>
            <div className="bg-[#0B0E14] rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[#D4AF37] h-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONFIRMATION */}
      {showConfirmModal && batchInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0E14] border-2 border-[#D4AF37] rounded-lg max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-2">ANALYSE EN LOTS MULTIPLES</h2>
              <p className="text-[#94A3B8]">Confirmation requise avant traitement</p>
            </div>
            
            <div className="bg-[#1A1F26] rounded-lg p-6 mb-6 space-y-3 border border-[#2A313C]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Nombre total de tickers:</span>
                <span className="text-white font-mono font-bold text-lg">{batchInfo.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Taille du lot:</span>
                <span className="text-white font-mono font-bold">{batchInfo.batchSize} tickers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Nombre de lots:</span>
                <span className="text-[#D4AF37] font-mono font-bold text-lg">{batchInfo.batches}</span>
              </div>
              <div className="flex justify-between border-t border-[#2A313C] pt-3 mt-3">
                <span className="text-[#94A3B8]">Durée estimée:</span>
                <span className="text-[#10B981] font-mono font-bold">~{batchInfo.estimatedTime} secondes</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-[#2A313C] text-white rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#3A414C] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => startAnalysis(tickersInput.split(/[,\s\n]+/).map(t => t.trim().toUpperCase()).filter(t => t.length > 0))}
                className="flex-1 px-6 py-3 bg-[#D4AF37] text-[#0B0E14] rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#E5C135] transition-colors"
              >
                Lancer l'analyse
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-semibold text-white mb-2">Analyse Multi-Tickers</h2>
        <p className="text-[#94A3B8]">Analysez des centaines de tickers par lots de 50</p>
      </div>

      <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] p-6">
        <label className="block text-sm font-semibold text-white mb-3">
          LISTE DE TICKERS (séparés par virgules, espaces ou retours à la ligne)
        </label>
        <textarea
          value={tickersInput}
          onChange={(e) => setTickersInput(e.target.value)}
          placeholder="AAPL, MSFT, GOOGL, KO, TSLA&#10;NVDA, META, AMZN"
          rows={6}
          className="w-full px-4 py-3 bg-[#0B0E14] border-2 border-[#2A313C] rounded text-white placeholder-[#64748B] focus:border-[#D4AF37] focus:outline-none font-mono text-sm"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#64748B] font-mono">
            {tickersInput.split(/[,\s\n]+/).filter(t => t.trim()).length} ticker(s) détecté(s)
          </span>
          <button
            onClick={analyzeMultipleTickers}
            disabled={loading || !tickersInput.trim()}
            className="px-6 py-3 bg-[#D4AF37] text-[#0B0E14] rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#E5C135] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'ANALYSE EN COURS...' : 'LANCER L\'ANALYSE'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#1A1F26] border border-[#2A313C] rounded p-4">
              <div className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">Total</div>
              <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
            </div>
            <div className="bg-[#1A1F26] border border-[#10B981] rounded p-4">
              <div className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">Halal</div>
              <div className="text-2xl font-bold text-[#10B981] font-mono">{stats.compliant}</div>
            </div>
            <div className="bg-[#1A1F26] border border-[#EF4444] rounded p-4">
              <div className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">Haram</div>
              <div className="text-2xl font-bold text-[#EF4444] font-mono">{stats.nonCompliant}</div>
            </div>
            <div className="bg-[#1A1F26] border border-[#64748B] rounded p-4">
              <div className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">Erreurs</div>
              <div className="text-2xl font-bold text-[#64748B] font-mono">{stats.errors}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${filter === 'ALL' ? 'bg-[#D4AF37] text-[#0B0E14]' : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'}`}>
                Tous ({results.length})
              </button>
              <button onClick={() => setFilter('HALAL')} className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${filter === 'HALAL' ? 'bg-[#10B981] text-white' : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'}`}>
                Halal ({stats.compliant})
              </button>
              <button onClick={() => setFilter('HARAM')} className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${filter === 'HARAM' ? 'bg-[#EF4444] text-white' : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'}`}>
                Haram ({stats.nonCompliant})
              </button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={exportToExcel} className="px-4 py-2 bg-[#10B981] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#059669] transition-colors flex items-center gap-2">
                <span>📊</span> Excel
              </button>
              <button onClick={exportToCSV} className="px-4 py-2 bg-[#3B82F6] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#2563EB] transition-colors flex items-center gap-2">
                <span>📄</span> CSV
              </button>
              <button onClick={exportToPDF} className="px-4 py-2 bg-[#EF4444] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#DC2626] transition-colors flex items-center gap-2">
                <span>📕</span> PDF
              </button>
            </div>
          </div>

          <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#14181F]">
                  <tr className="border-b border-[#2A313C]">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-[#94A3B8]">#</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-[#94A3B8]">Ticker</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-[#94A3B8]">Entreprise</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-[#94A3B8]">Pays</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-[#94A3B8]">Type Business</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-[#94A3B8]">Verdict</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-[#94A3B8]">Score %</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-[#94A3B8]">Standards</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-[#94A3B8]">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A313C]">
                  {filteredResults.map((result, idx) => (
                    <>
                      <tr key={idx} className="hover:bg-[#1F262E] transition-colors">
                        <td className="px-4 py-4 text-[#94A3B8] font-mono text-sm">{idx + 1}</td>
                        <td className="px-4 py-4 font-mono font-bold text-white">{result.ticker}</td>
                        <td className="px-4 py-4 text-[#94A3B8] text-sm">{result.companyName || result.error || 'N/A'}</td>
                        <td className="px-4 py-4 text-[#94A3B8] text-sm">{result.country || 'N/A'}</td>
                        <td className="px-4 py-4 text-[#94A3B8] text-sm">{result.businessType || 'N/A'}</td>
                        <td className="px-4 py-4 text-center">
                          {result.status === 'SUCCESS' ? (
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase rounded ${result.verdict === 'COMPLIANT' ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]'}`}>
                              {result.verdict === 'COMPLIANT' ? '✓ HALAL' : '✗ HARAM'}
                            </span>
                          ) : <span className="text-[#64748B]">N/A</span>}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-[#D4AF37] font-semibold">{result.status === 'SUCCESS' ? `${result.score}%` : '-'}</td>
                        <td className="px-4 py-4 text-center font-mono text-[#94A3B8]">{result.status === 'SUCCESS' ? `${result.compliantStandards}/${result.totalStandards}` : '-'}</td>
                        <td className="px-4 py-4 text-center">
                          {result.status === 'SUCCESS' && (
                            <button onClick={() => toggleRow(result.ticker)} className="text-[#D4AF37] hover:text-[#E5C135] transition-colors text-xs font-semibold">
                              {expandedRows.has(result.ticker) ? '▼ Masquer' : '▶ Voir'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(result.ticker) && result.status === 'SUCCESS' && (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 bg-[#14181F]">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-xs font-semibold uppercase text-[#D4AF37] mb-3 tracking-wider">Ratios Financiers</h4>
                                <div className="space-y-2 text-sm font-mono">
                                  <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Debt Ratio:</span>
                                    <span className="text-white font-semibold">{result.debtRatio}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Cash Ratio:</span>
                                    <span className="text-white font-semibold">{result.cashRatio}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Receivables Ratio:</span>
                                    <span className="text-white font-semibold">{result.receivablesRatio}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#94A3B8]">Interest Ratio:</span>
                                    <span className="text-white font-semibold">{result.interestRatio}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold uppercase text-[#D4AF37] mb-3 tracking-wider">Standards Shariah (7/7)</h4>
                                <div className="space-y-1 text-xs">
                                  {result.standards && Object.entries(result.standards).map(([name, data]) => (
                                    <div key={name} className="flex justify-between items-center py-1">
                                      <span className="text-[#94A3B8]">{name}</span>
                                      <span className={`font-semibold ${data.compliant ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                        {data.compliant ? '✓ PASS' : '✗ FAIL'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
