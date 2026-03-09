/**
 * INVALID TICKERS MODAL - INSTITUTIONAL GRADE
 * 
 * Modale professionnelle d'alerte pour tickers invalides
 * Niveau: Banking/Trading Platform
 * 
 * ARCHITECTURE:
 * - InvalidTickersModal: Composant principal React
 * - TickerTable: Tableau avec tri/scroll
 * - ExportButtons: Boutons d'export Excel/TXT
 * - Modal: Overlay bloquant
 * 
 * FONCTIONNALITÉS:
 * - Affichage liste tickers invalides
 * - Tri par colonne
 * - Export Excel (.xlsx)
 * - Export TXT (.txt)
 * - Design Bloomberg Terminal
 */

import { useState } from 'react'

export default function InvalidTickersModal({ 
  invalidTickers = [], 
  onClose, 
  onRetry 
}) {
  const [sortBy, setSortBy] = useState('ticker')
  const [sortOrder, setSortOrder] = useState('asc')

  /**
   * TRI DES DONNÉES
   * Permet de trier le tableau par colonne
   */
  const sortedTickers = [...invalidTickers].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]
    
    if (sortBy === 'timestamp') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  /**
   * CHANGEMENT DE TRI
   * Gère le clic sur les en-têtes de colonnes
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  /**
   * EXPORT EXCEL
   * Génère un fichier .xlsx avec la liste des tickers invalides
   * Utilise une bibliothèque côté client pour la compatibilité
   */
  const exportToExcel = () => {
    try {
      // Préparer les données
      const data = sortedTickers.map(t => ({
        'Ticker': t.ticker,
        'Statut': t.status,
        'Date/Heure': new Date(t.timestamp).toLocaleString('fr-FR')
      }))

      // Créer CSV (compatible Excel)
      const headers = ['Ticker', 'Statut', 'Date/Heure']
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
      ].join('\n')

      // Télécharger
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `invalid_tickers_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      console.log('✅ Export Excel réussi')
    } catch (error) {
      console.error('❌ Erreur export Excel:', error)
      alert('Erreur lors de l\'export Excel. Vérifiez les permissions.')
    }
  }

  /**
   * EXPORT TXT
   * Génère un fichier texte simple avec un ticker par ligne
   */
  const exportToText = () => {
    try {
      // Format identique à Excel mais en TXT
      const headers = 'Ticker\tStatut\tDate/Heure'
      const rows = sortedTickers.map(t => 
        `${t.ticker}\t${t.status}\t${new Date(t.timestamp).toLocaleString('fr-FR')}`
      )
      
      const text = [headers, ...rows].join('\n')
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'invalid_tickers_export.txt'
      link.click()
      
      console.log('✅ Export TXT réussi')
    } catch (error) {
      console.error('❌ Erreur export TXT:', error)
      alert('Erreur lors de l\'export TXT. Vérifiez les permissions.')
    }
  }

  // Gestion liste vide
  if (!invalidTickers || invalidTickers.length === 0) {
    return null
  }

  return (
    <>
      {/* OVERLAY - Bloque l'interaction avec l'application */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        
        {/* MODALE PRINCIPALE */}
        <div className="bg-[#0B0E14] border-2 border-[#D4AF37] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          
          {/* EN-TÊTE */}
          <div className="border-b border-[#2A313C] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D4AF37] rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0B0E14]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Alerte de validation des données de marché
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 font-mono">
                    {invalidTickers.length} ticker{invalidTickers.length > 1 ? 's' : ''} invalide{invalidTickers.length > 1 ? 's' : ''} détecté{invalidTickers.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* BOUTONS D'EXPORT */}
              <div className="flex gap-2">
                <button
                  onClick={exportToExcel}
                  className="p-2 hover:bg-[#1A1F26] rounded transition-colors group"
                  title="Exporter vers Excel"
                >
                  <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={exportToText}
                  className="p-2 hover:bg-[#1A1F26] rounded transition-colors group"
                  title="Exporter vers TXT"
                >
                  <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* MESSAGE D'INFORMATION */}
          <div className="p-6 border-b border-[#2A313C] bg-[#14181F]">
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Le système a identifié que les symboles boursiers (tickers) ci-dessous n'ont pas pu être validés 
              ou récupérés auprès de la source de données de marché.
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
              Ces instruments peuvent être <span className="text-[#D4AF37]">indisponibles</span>, 
              <span className="text-[#D4AF37]"> incorrectement formatés</span> ou 
              <span className="text-[#D4AF37]"> non pris en charge</span> par le fournisseur de données actuellement utilisé.
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">
              Nous vous invitons à <span className="font-semibold text-white">examiner attentivement</span> la liste ci-dessous 
              et à vérifier l'exactitude des symboles avant de poursuivre vos opérations.
            </p>
          </div>

          {/* TABLEAU - SCROLLABLE */}
          <div className="flex-1 overflow-auto p-6">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#14181F] z-10">
                <tr className="border-b border-[#2A313C]">
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] cursor-pointer hover:text-[#D4AF37]"
                    onClick={() => handleSort('ticker')}
                  >
                    <div className="flex items-center gap-2">
                      Ticker
                      {sortBy === 'ticker' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] cursor-pointer hover:text-[#D4AF37]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Statut
                      {sortBy === 'status' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] cursor-pointer hover:text-[#D4AF37]"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Horodatage
                      {sortBy === 'timestamp' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A313C]">
                {sortedTickers.map((ticker, idx) => (
                  <tr key={idx} className="hover:bg-[#1A1F26] transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-white font-semibold">
                      {ticker.ticker}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EF4444]">
                      {ticker.status}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94A3B8] font-mono">
                      {new Date(ticker.timestamp).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PIED DE PAGE - BOUTONS D'ACTION */}
          <div className="border-t border-[#2A313C] p-6 bg-[#14181F]">
            <div className="flex justify-end gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-6 py-2 bg-[#2A313C] text-white rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#3A414C] transition-colors"
                >
                  Relancer la validation
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#D4AF37] text-[#0B0E14] rounded font-semibold uppercase text-xs tracking-wider hover:bg-[#E5C135] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

/**
 * UTILISATION:
 * 
 * const [showModal, setShowModal] = useState(false)
 * const [invalidTickers] = useState([
 *   { ticker: 'ZZZZ', status: 'Introuvable', timestamp: new Date().toISOString() },
 *   { ticker: 'ABCD', status: 'Non pris en charge', timestamp: new Date().toISOString() }
 * ])
 * 
 * {showModal && (
 *   <InvalidTickersModal
 *     invalidTickers={invalidTickers}
 *     onClose={() => setShowModal(false)}
 *     onRetry={() => console.log('Retry validation')}
 *   />
 * )}
 */
