import { useState } from 'react'
import Head from 'next/head'
import InvalidTickersModal from './InvalidTickersModal'
import MultiTickerBatch from './MultiTickerBatch'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showInvalidModal, setShowInvalidModal] = useState(false)
  const [invalidTickers, setInvalidTickers] = useState([])
  const [activeMode, setActiveMode] = useState('single') // single, batch, excel

  const analyzeTicker = async () => {
    if (!ticker) return
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/backend/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          language: 'EN'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        
        if (response.status === 404) {
          // Ticker not found - Afficher modale professionnelle
          setInvalidTickers([{
            ticker: ticker.toUpperCase(),
            status: 'Introuvable - Vérifiez l\'orthographe ou l\'existence sur les marchés',
            timestamp: new Date().toISOString()
          }])
          setShowInvalidModal(true)
          setLoading(false)
          return
        }
        
        throw new Error(errorData?.detail || `Erreur API (${response.status})`)
      }
      
      const data = await response.json()
      
      setResult({
        ticker: data.ticker,
        companyName: data.company_name,
        verdict: data.verdict,
        score: data.score,
        standards: transformStandards(data.standards),
        financials: data.financials
      })
      
    } catch (error) {
      console.error('Analysis failed:', error)
      
      if (error.message.includes('Failed to fetch')) {
        alert(`❌ ERREUR DE CONNEXION\n\nL'API n'est pas accessible.\n\nVérifiez que:\n• L'API tourne sur http://localhost:8000\n• Aucun pare-feu ne bloque la connexion`)
      } else {
        alert(`❌ ERREUR D'ANALYSE\n\n${error.message}\n\nSi le problème persiste, contactez le support technique.`)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const transformStandards = (apiStandards) => {
    const transformed = {}
    Object.entries(apiStandards).forEach(([name, data]) => {
      transformed[name] = {
        pass: data.compliant,
        debtRatio: data.ratios.debt,
        threshold: data.thresholds.debt,
        cashRatio: data.ratios.cash,
        cashThreshold: data.thresholds.cash,
        receivablesRatio: data.ratios.receivables,
        receivablesThreshold: data.thresholds.receivables,
        interestRatio: data.ratios.interest,
        interestThreshold: data.thresholds.interest
      }
    })
    return transformed
  }

  const formatNumber = (num) => {
    if (num >= 1000000000) return `$${(num/1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num/1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num/1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  return (
    <>
      <Head>
        <title>HALALSCORE | Shariah Compliance Analytics</title>
        <meta name="description" content="Professional Shariah compliance analysis platform for institutional investors" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#0B0E14]">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0B0E14]/95 backdrop-blur-sm border-b border-[#2A313C] z-50">
          <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded flex items-center justify-center">
                <span className="text-[#0B0E14] font-bold text-xl font-mono">HS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-light tracking-[0.1em] text-sm text-white">HALALSCORE</span>
                <span className="text-[10px] text-[#64748B] tracking-[0.05em]">SHARIAH COMPLIANCE DATA</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <a href="#" className="text-white text-xs uppercase tracking-wider px-4 py-2 border-b-2 border-[#D4AF37]">Dashboard</a>
              <a href="#" className="text-[#94A3B8] text-xs uppercase tracking-wider px-4 py-2 hover:text-white transition-colors">Companies</a>
              <a href="#" className="text-[#94A3B8] text-xs uppercase tracking-wider px-4 py-2 hover:text-white transition-colors">Standards</a>
              <a href="#" className="text-[#94A3B8] text-xs uppercase tracking-wider px-4 py-2 hover:text-white transition-colors">Reports</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="text-[#94A3B8] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <span className="text-xs text-[#64748B] font-mono">v2.4.0</span>
            </div>
          </div>
        </header>

        <div className="h-16"></div>

        {/* Main Content */}
        <main className="max-w-[1440px] mx-auto px-8 py-12">
          
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-semibold tracking-tight text-white mb-4">
              Shariah Compliance Analysis
            </h1>
            <p className="text-lg text-[#94A3B8] font-mono">
              Institutional-grade analytics · 7 international standards · Verified data
            </p>
          </div>

          {/* MODE NAVIGATION */}
          <div className="mb-8 flex gap-2 border-b border-[#2A313C]">
            <button
              onClick={() => setActiveMode('single')}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                activeMode === 'single'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Mode 1: Single Ticker
            </button>
            <button
              onClick={() => setActiveMode('batch')}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                activeMode === 'batch'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Mode 2: Multi-Ticker Batch
            </button>
            <button
              onClick={() => setActiveMode('excel')}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                activeMode === 'excel'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Mode 3: Excel Import
            </button>
          </div>

          {/* MODE 1: SINGLE TICKER */}
          {activeMode === 'single' && (
            <>
          {/* Search */}
          <div className="mb-16">
            <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeTicker()}
                  placeholder="ENTER TICKER SYMBOL (e.g., AAPL, MSFT, TSLA)"
                  className="flex-1 px-6 py-4 bg-[#0B0E14] border-2 border-[#2A313C] rounded text-white placeholder-[#64748B] focus:border-[#D4AF37] focus:outline-none transition-colors font-mono text-sm tracking-wider"
                />
                <button
                  onClick={analyzeTicker}
                  disabled={loading || !ticker}
                  className="px-8 py-4 bg-[#D4AF37] text-[#0B0E14] rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#E5C135] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
                >
                  {loading ? 'ANALYZING...' : 'ANALYZE'}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mt-4 font-mono">
                Real-time Shariah compliance analysis
              </p>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Main Result Card */}
              <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2A313C]">
                  <div>
                    <h2 className="text-4xl font-semibold text-white mb-2">{result.ticker}</h2>
                    <p className="text-sm text-[#94A3B8]">{result.companyName}</p>
                    <p className="text-xs text-[#64748B] font-mono mt-1">
                      Analysis Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-8 py-4 rounded text-2xl font-bold font-mono ${
                    result.verdict === 'COMPLIANT' 
                      ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border-2 border-[rgba(16,185,129,0.2)]' 
                      : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-2 border-[rgba(239,68,68,0.2)]'
                  }`}>
                    {result.verdict === 'COMPLIANT' ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8]">Consensus Score</span>
                    <span className="text-2xl font-medium text-[#D4AF37] font-mono">{result.score}%</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8]">Total Assets</span>
                    <span className="text-2xl font-medium text-[#D4AF37] font-mono">{formatNumber(result.financials.total_assets)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8]">Total Revenue</span>
                    <span className="text-2xl font-medium text-[#D4AF37] font-mono">{formatNumber(result.financials.total_revenue)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8]">Standards Pass</span>
                    <span className={`text-2xl font-medium font-mono ${result.verdict === 'COMPLIANT' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {result.verdict === 'COMPLIANT' ? '7/7' : '0/7'}
                    </span>
                  </div>
                </div>

                {/* Standards Table */}
                <div className="overflow-hidden rounded border border-[#2A313C]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#14181F]">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Standard</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Debt</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Cash</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Receivables</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Interest</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A313C]">
                      {Object.entries(result.standards).map(([name, data], idx) => {
                        const debtValue = parseFloat(data.debtRatio)
                        const cashValue = parseFloat(data.cashRatio)
                        const recValue = parseFloat(data.receivablesRatio)
                        const intValue = parseFloat(data.interestRatio)
                        
                        const debtThreshold = parseFloat(data.threshold)
                        const cashThreshold = parseFloat(data.cashThreshold || data.threshold)
                        const recThreshold = parseFloat(data.receivablesThreshold || '45')
                        const intThreshold = 5.0
                        
                        const debtExceeds = debtValue > debtThreshold
                        const cashExceeds = cashValue > cashThreshold
                        const recExceeds = recValue > recThreshold
                        const intExceeds = intValue > intThreshold
                        
                        return (
                          <tr key={idx} className="hover:bg-[#1F262E] transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{name}</td>
                            
                            <td className={`px-6 py-4 text-right font-mono ${debtExceeds ? 'bg-white' : ''}`}>
                              <span className={debtExceeds ? 'text-red-600 font-bold' : 'text-[#94A3B8]'}>
                                {data.debtRatio}
                              </span>
                              <span className="text-[#64748B] text-xs ml-2">≤{data.threshold}</span>
                            </td>
                            
                            <td className={`px-6 py-4 text-right font-mono ${cashExceeds ? 'bg-white' : ''}`}>
                              <span className={cashExceeds ? 'text-red-600 font-bold' : 'text-[#94A3B8]'}>
                                {data.cashRatio}
                              </span>
                            </td>
                            
                            <td className={`px-6 py-4 text-right font-mono ${recExceeds ? 'bg-white' : ''}`}>
                              <span className={recExceeds ? 'text-red-600 font-bold' : 'text-[#94A3B8]'}>
                                {data.receivablesRatio || 'N/A'}
                              </span>
                            </td>
                            
                            <td className={`px-6 py-4 text-right font-mono ${intExceeds ? 'bg-white' : ''}`}>
                              <span className={intExceeds ? 'text-red-600 font-bold' : 'text-[#94A3B8]'}>
                                {data.interestRatio}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded ${
                                data.pass 
                                  ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]' 
                                  : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]'
                              }`}>
                                {data.pass ? '✓ PASS' : '✗ FAIL'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] p-8">
                <h3 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-[#2A313C]">Financial Data Extract</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Total Assets</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.total_assets)}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Total Debt</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.total_debt)}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Total Revenue</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.total_revenue)}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Interest Income</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.interest_income)}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Cash & Equivalents</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.cash)}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-2">Receivables</span>
                    <span className="text-xl font-mono text-white">{formatNumber(result.financials.receivables)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] mt-6 font-mono">
                  Source: Official regulatory filings · Multi-source verification
                </p>
              </div>

              {/* Disclaimer */}
              <div className="bg-[rgba(245,158,11,0.1)] border-l-4 border-[#F59E0B] rounded p-6">
                <h4 className="font-bold text-[#F59E0B] mb-3 text-sm uppercase tracking-wider">⚠ IMPORTANT DISCLAIMER</h4>
                <p className="text-sm text-[#94A3B8] leading-relaxed font-mono">
                  This analysis is provided FOR INFORMATIONAL PURPOSES ONLY. It does not constitute investment advice, 
                  a religious ruling (fatwa), or a guarantee of Shariah compliance. Data sourced from official regulatory filings 
                  and verified through multi-source validation. Analysis date: {new Date().toLocaleString('en-GB')}. 
                  Always consult a qualified Islamic scholar and licensed financial advisor before making investment decisions.
                </p>
              </div>

            </div>
          )}

          {/* Initial State - No Results */}
          {!result && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#1A1F26] rounded-lg p-8 border border-[#2A313C] hover:border-[#D4AF37] transition-colors">
                <div className="w-12 h-12 bg-[rgba(212,175,55,0.1)] rounded flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">7 Global Standards</h3>
                <p className="text-[#94A3B8] text-sm">
                  AAOIFI, DJIM, S&P, MSCI, FTSE, Meezan, Usmani - the most comprehensive coverage available.
                </p>
              </div>
              
              <div className="bg-[#1A1F26] rounded-lg p-8 border border-[#2A313C] hover:border-[#D4AF37] transition-colors">
                <div className="w-12 h-12 bg-[rgba(212,175,55,0.1)] rounded flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Verified Data Sources</h3>
                <p className="text-[#94A3B8] text-sm">
                  Multi-source validation from official regulatory filings and institutional databases.
                </p>
              </div>
              
              <div className="bg-[#1A1F26] rounded-lg p-8 border border-[#2A313C] hover:border-[#D4AF37] transition-colors">
                <div className="w-12 h-12 bg-[rgba(212,175,55,0.1)] rounded flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Verified Methodology</h3>
                <p className="text-[#94A3B8] text-sm">
                  Rigorous validation process. No speculative data. Transparent methodology. Full audit trail.
                </p>
              </div>
            </div>
          )}

            </>
          )}

          {/* MODE 2: MULTI-TICKER BATCH */}
          {activeMode === 'batch' && (
            <MultiTickerBatch />
          )}

          {/* MODE 3: EXCEL IMPORT */}
          {activeMode === 'excel' && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Mode 3: Excel Import</h3>
              <p className="text-[#94A3B8]">En cours de développement...</p>
            </div>
          )}

        </main>

        {/* Invalid Tickers Modal */}
        {showInvalidModal && (
          <InvalidTickersModal
            invalidTickers={invalidTickers}
            onClose={() => setShowInvalidModal(false)}
            onRetry={() => {
              setShowInvalidModal(false)
              setTicker('')
            }}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-[#2A313C] bg-[#14181F] mt-20">
          <div className="max-w-[1440px] mx-auto px-8 py-8">
            <div className="text-center text-sm text-[#64748B] font-mono">
              <p>© 2026 HALALSCORE | Universal Shariah Compliance Analytics</p>
              <p className="mt-2">Institutional-Grade Financial Analysis Platform</p>
            </div>
          </div>
        </footer>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </>
  )
}
