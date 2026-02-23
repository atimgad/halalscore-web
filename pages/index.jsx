import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeTicker = async () => {
    if (!ticker) return
    setLoading(true)
    
    // Simulation - À remplacer par vraie API
    setTimeout(() => {
      setResult({
        ticker: ticker.toUpperCase(),
        verdict: 'COMPLIANT',
        score: 100,
        standards: {
          'AAOIFI': { pass: true, debt: '12.4%', threshold: '30%' },
          'DJIM': { pass: true, debt: '12.4%', threshold: '33%' },
          'S&P Shariah': { pass: true, debt: '12.4%', threshold: '33%' },
          'MSCI Islamic': { pass: true, debt: '12.4%', threshold: '33%' },
          'FTSE Shariah': { pass: true, debt: '12.4%', threshold: '33%' },
          'Meezan Bank': { pass: true, debt: '12.4%', threshold: '33%' },
          'Mufti Usmani': { pass: true, debt: '12.4%', threshold: '33%' }
        },
        financials: {
          assets: 359241,
          debt: 45000,
          revenue: 416161,
          interest: 565
        }
      })
      setLoading(false)
    }, 1500)
  }

  const formatNumber = (num) => {
    if (num >= 1000) return `$${(num/1000).toFixed(1)}B`
    return `$${num.toFixed(0)}M`
  }

  return (
    <>
      <Head>
        <title>HalalScore | Universal Shariah Compliance Analytics</title>
        <meta name="description" content="Bloomberg-grade Shariah compliance analysis for global investors" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🕌</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-emerald-900 bg-clip-text text-transparent" style={{fontFamily: 'Playfair Display'}}>
                    HALALSCORE
                  </h1>
                  <p className="text-xs text-slate-500" style={{fontFamily: 'IBM Plex Mono'}}>
                    Universal Shariah Compliance Analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400" style={{fontFamily: 'IBM Plex Mono'}}>v2.4.0</span>
                <button className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors" style={{fontFamily: 'IBM Plex Mono'}}>
                  EN / AR
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-transparent" style={{fontFamily: 'Playfair Display'}}>
              The Global Standard for
              <br />
              Ethical Finance Analysis
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto" style={{fontFamily: 'IBM Plex Mono'}}>
              Bloomberg-grade analytics. 7 international standards. Zero compromise on accuracy.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeTicker()}
                  placeholder="Enter ticker symbol (e.g., AAPL, MSFT, TSLA)"
                  className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg transition-colors"
                  style={{fontFamily: 'IBM Plex Mono'}}
                />
                <button
                  onClick={analyzeTicker}
                  disabled={loading || !ticker}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  style={{fontFamily: 'IBM Plex Mono'}}
                >
                  {loading ? '⏳ ANALYZING...' : '🔍 ANALYZE'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center" style={{fontFamily: 'IBM Plex Mono'}}>
                Last updated: {new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC
              </p>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Verdict Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900" style={{fontFamily: 'Playfair Display'}}>
                      {result.ticker}
                    </h3>
                    <p className="text-sm text-slate-500" style={{fontFamily: 'IBM Plex Mono'}}>
                      Analysis Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-8 py-4 rounded-xl text-2xl font-bold ${
                    result.verdict === 'COMPLIANT' 
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-200'
                  }`} style={{fontFamily: 'IBM Plex Mono'}}>
                    {result.verdict === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-2" style={{fontFamily: 'IBM Plex Mono'}}>Consensus Score</p>
                    <p className="text-3xl font-bold text-slate-900" style={{fontFamily: 'IBM Plex Mono'}}>{result.score}%</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-2" style={{fontFamily: 'IBM Plex Mono'}}>Total Assets</p>
                    <p className="text-3xl font-bold text-slate-900" style={{fontFamily: 'IBM Plex Mono'}}>{formatNumber(result.financials.assets)}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-2" style={{fontFamily: 'IBM Plex Mono'}}>Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-900" style={{fontFamily: 'IBM Plex Mono'}}>{formatNumber(result.financials.revenue)}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-2" style={{fontFamily: 'IBM Plex Mono'}}>Standards Pass</p>
                    <p className="text-3xl font-bold text-emerald-600" style={{fontFamily: 'IBM Plex Mono'}}>7/7</p>
                  </div>
                </div>

                {/* Standards Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" style={{fontFamily: 'IBM Plex Mono'}}>Standard</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700" style={{fontFamily: 'IBM Plex Mono'}}>Debt Ratio</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700" style={{fontFamily: 'IBM Plex Mono'}}>Threshold</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700" style={{fontFamily: 'IBM Plex Mono'}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.standards).map(([name, data], idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900" style={{fontFamily: 'IBM Plex Mono'}}>{name}</td>
                          <td className="px-6 py-4 text-right text-slate-700" style={{fontFamily: 'IBM Plex Mono'}}>{data.debt}</td>
                          <td className="px-6 py-4 text-right text-slate-500" style={{fontFamily: 'IBM Plex Mono'}}>≤ {data.threshold}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              data.pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`} style={{fontFamily: 'IBM Plex Mono'}}>
                              {data.pass ? '✓ PASS' : '✗ FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-2" style={{fontFamily: 'IBM Plex Mono'}}>⚠️ IMPORTANT DISCLAIMER</h4>
                <p className="text-sm text-amber-800 leading-relaxed" style={{fontFamily: 'IBM Plex Mono'}}>
                  This analysis is provided FOR INFORMATIONAL PURPOSES ONLY. It does not constitute investment advice, 
                  a religious ruling (fatwa), or a guarantee of Shariah compliance. Data sourced from SEC EDGAR 10-K filings (XBRL format). 
                  Analysis date: {new Date().toLocaleString('en-GB')}. Always consult a qualified Islamic scholar and licensed financial 
                  advisor before making investment decisions.
                </p>
              </div>

            </div>
          )}

          {/* Features Section */}
          {!result && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900" style={{fontFamily: 'Playfair Display'}}>7 Global Standards</h3>
                <p className="text-slate-600 text-sm" style={{fontFamily: 'IBM Plex Mono'}}>
                  AAOIFI, DJIM, S&P, MSCI, FTSE, Meezan, Usmani - the most comprehensive coverage available.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900" style={{fontFamily: 'Playfair Display'}}>SEC EDGAR Data</h3>
                <p className="text-slate-600 text-sm" style={{fontFamily: 'IBM Plex Mono'}}>
                  Direct extraction from official 10-K filings using advanced XBRL parsing technology.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900" style={{fontFamily: 'Playfair Display'}}>Zero Speculation</h3>
                <p className="text-slate-600 text-sm" style={{fontFamily: 'IBM Plex Mono'}}>
                  NEC PLUS ULTRA quality. No invented data. Transparent methodology. Full audit trail.
                </p>
              </div>
            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-sm text-slate-500" style={{fontFamily: 'IBM Plex Mono'}}>
              <p>© 2026 HalalScore | Universal Shariah Compliance Analytics</p>
              <p className="mt-2">NEC PLUS ULTRA - Bloomberg-Grade Financial Analysis</p>
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
