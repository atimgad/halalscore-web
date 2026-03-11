/**
 * MULTI-TICKER BATCH ANALYSIS
 * 
 * Permet d'analyser plusieurs tickers en une seule opération
 * Affiche un tableau comparatif des résultats
 * 
 * FONCTIONNALITÉS:
 * - Saisie multiple (séparés par virgules ou espaces)
 * - Analyse parallèle
 * - Tableau comparatif
 * - Export Excel/CSV
 * - Filtrage par verdict (HALAL/HARAM)
 */

import { useState } from 'react'

export default function MultiTickerBatch() {
  const [tickersInput, setTickersInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL, HALAL, HARAM

  /**
   * ANALYSER PLUSIEURS TICKERS
   * Parse l'input et lance les analyses par lots de 50
   */
  const analyzeMultipleTickers = async () => {
    if (!tickersInput.trim()) return
    
    setLoading(true)
    setResults([])
    
    // Parse input (virgules, espaces, retours à la ligne)
    const tickers = tickersInput
      .split(/[,\s\n]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0)
    
    if (tickers.length === 0) {
      alert('Veuillez entrer au moins un ticker valide')
      setLoading(false)
      return
    }
    
    // Calcul du nombre de lots
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(tickers.length / BATCH_SIZE)
    
    // Message d'information si > 50 tickers
    if (tickers.length > BATCH_SIZE) {
      const confirmed = confirm(
        `📊 ANALYSE EN LOTS\n\n` +
        `Nombre total de tickers: ${tickers.length}\n` +
        `Taille du lot: ${BATCH_SIZE} tickers\n` +
        `Nombre de lots: ${totalBatches}\n\n` +
        `L'analyse va se faire en ${totalBatches} séries.\n` +
        `Durée estimée: ${Math.ceil(totalBatches * 10)} secondes\n\n` +
        `Voulez-vous continuer ?`
      )
      
      if (!confirmed) {
        setLoading(false)
        return
      }
    }
    
    // Analyser par lots
    const allResults = []
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, tickers.length)
      const batchTickers = tickers.slice(start, end)
      
      console.log(`📊 Analyse lot ${batchIndex + 1}/${totalBatches}: ${batchTickers.length} tickers`)
      
      // Analyser ce lot en parallèle
      const promises = batchTickers.map((ticker, index) => 
        analyzeSingleTickerWithProgress(ticker, start + index, tickers.length)
      )
      
      const batchResults = await Promise.all(promises)
      allResults.push(...batchResults)
      
      // Mettre à jour l'affichage progressivement
      setResults([...allResults])
    }
    
    console.log(`✅ Analyse terminée: ${allResults.length} tickers traités`)
    setLoading(false)
  }

  /**
   * ANALYSER UN SEUL TICKER AVEC PROGRESSION
   * Retourne un objet résultat formaté et log la progression
   */
  const analyzeSingleTickerWithProgress = async (ticker, index, total) => {
    console.log(`[${index + 1}/${total}] Analyse de ${ticker}...`)
    
    try {
      const response = await fetch('/api/backend/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: ticker,
          language: 'EN'
        })
      })
      
      if (!response.ok) {
        return {
          ticker,
          status: 'ERROR',
          verdict: 'N/A',
          score: 0,
          error: response.status === 404 ? 'Ticker introuvable' : 'Erreur API'
        }
      }
      
      const data = await response.json()
      
      return {
        ticker: data.ticker,
        companyName: data.company_name,
        status: 'SUCCESS',
        verdict: data.verdict,
        score: data.score,
        compliantStandards: data.compliant_standards,
        totalStandards: data.total_standards,
        financials: data.financials
      }
      
    } catch (error) {
      return {
        ticker,
        status: 'ERROR',
        verdict: 'N/A',
        score: 0,
        error: 'Erreur de connexion'
      }
    }
  }

  /**
   * EXPORT CSV
   * Exporte les résultats au format CSV
   */
  const exportToCSV = () => {
    const headers = ['Ticker', 'Entreprise', 'Verdict', 'Score', 'Standards', 'Statut']
    const rows = filteredResults.map(r => [
      r.ticker,
      r.companyName || 'N/A',
      r.verdict,
      r.score,
      r.status === 'SUCCESS' ? `${r.compliantStandards}/${r.totalStandards}` : 'N/A',
      r.status
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `batch_analysis_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Filtrer les résultats
  const filteredResults = results.filter(r => {
    if (filter === 'ALL') return true
    if (filter === 'HALAL') return r.verdict === 'COMPLIANT'
    if (filter === 'HARAM') return r.verdict === 'NON-COMPLIANT'
    return true
  })

  // Statistiques
  const stats = {
    total: results.length,
    compliant: results.filter(r => r.verdict === 'COMPLIANT').length,
    nonCompliant: results.filter(r => r.verdict === 'NON-COMPLIANT').length,
    errors: results.filter(r => r.status === 'ERROR').length
  }

  return (
    <div className="space-y-6">
      
      {/* TITRE */}
      <div>
        <h2 className="text-3xl font-semibold text-white mb-2">Analyse Multi-Tickers</h2>
        <p className="text-[#94A3B8]">Analysez jusqu'à 50 tickers simultanément</p>
      </div>

      {/* INPUT */}
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

      {/* STATISTIQUES */}
      {results.length > 0 && (
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
      )}

      {/* FILTRES ET EXPORT */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'ALL' 
                  ? 'bg-[#D4AF37] text-[#0B0E14]' 
                  : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'
              }`}
            >
              Tous ({results.length})
            </button>
            <button
              onClick={() => setFilter('HALAL')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'HALAL' 
                  ? 'bg-[#10B981] text-white' 
                  : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'
              }`}
            >
              Halal ({stats.compliant})
            </button>
            <button
              onClick={() => setFilter('HARAM')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'HARAM' 
                  ? 'bg-[#EF4444] text-white' 
                  : 'bg-[#2A313C] text-[#94A3B8] hover:bg-[#3A414C]'
              }`}
            >
              Haram ({stats.nonCompliant})
            </button>
          </div>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-[#2A313C] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#3A414C] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      )}

      {/* TABLEAU RÉSULTATS */}
      {filteredResults.length > 0 && (
        <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#14181F]">
                <tr className="border-b border-[#2A313C]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Ticker</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Entreprise</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Verdict</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Standards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A313C]">
                {filteredResults.map((result, idx) => (
                  <tr key={idx} className="hover:bg-[#1F262E] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">{result.ticker}</td>
                    <td className="px-6 py-4 text-[#94A3B8]">{result.companyName || result.error || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      {result.status === 'SUCCESS' ? (
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded ${
                          result.verdict === 'COMPLIANT'
                            ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]'
                            : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]'
                        }`}>
                          {result.verdict === 'COMPLIANT' ? '✓ HALAL' : '✗ HARAM'}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[#D4AF37] font-semibold">
                      {result.status === 'SUCCESS' ? `${result.score}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-[#94A3B8]">
                      {result.status === 'SUCCESS' ? `${result.compliantStandards}/${result.totalStandards}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOADING AVEC PROGRESSION */}
      {loading && (
        <div className="bg-[#1A1F26] rounded-lg border border-[#2A313C] p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mb-4"></div>
            <p className="text-white font-semibold text-lg mb-2">Analyse en cours...</p>
            <p className="text-[#94A3B8] font-mono text-sm mb-4">
              {results.length > 0 
                ? `${results.length} ticker(s) analysé(s)` 
                : 'Démarrage de l\'analyse...'}
            </p>
            
            {/* Barre de progression */}
            {results.length > 0 && (
              <div className="w-full max-w-md mx-auto">
                <div className="bg-[#0B0E14] rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-[#D4AF37] h-full transition-all duration-300"
                    style={{ 
                      width: `${(results.length / tickersInput.split(/[,\s\n]+/).filter(t => t.trim()).length) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-[#64748B] text-xs mt-2 font-mono">
                  {results.length} / {tickersInput.split(/[,\s\n]+/).filter(t => t.trim()).length} tickers
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
