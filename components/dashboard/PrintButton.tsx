'use client'

import { useState } from 'react'
import { FileDown, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PrintButtonProps {
  clientName: string
  periodLabel: string
  dateRange: string
}

export function PrintButton({ clientName, periodLabel, dateRange }: PrintButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleExport() {
    setStatus('loading')

    const controls = document.getElementById('dashboard-header-controls')
    const titleSection = document.getElementById('dashboard-title-section')
    const content = document.getElementById('dashboard-export-content')
    if (!content) { setStatus('idle'); return }

    // Esconde os filtros, o botão e o título nativo (substituído pelo header do PDF)
    if (controls) controls.style.display = 'none'
    if (titleSection) titleSection.style.display = 'none'

    // Lê branding da agência do DOM
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--agency-primary').trim() || '#2563eb'
    const logoEl = document.querySelector<HTMLImageElement>('header img')
    const agencyNameEl = document.querySelector<HTMLElement>('header span.font-semibold')
    const agencyName = agencyNameEl?.textContent?.trim() ?? ''
    const logoSrc = logoEl?.src ?? ''

    // Cria o header profissional do PDF
    const now = new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const pdfHeader = document.createElement('div')
    pdfHeader.id = 'pdf-export-header'
    pdfHeader.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 20px;
        margin-bottom: 28px;
        border-bottom: 2px solid ${primaryColor};
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div>
          <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.08em; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">
            Relatório de Performance
          </div>
          <div style="font-size: 26px; font-weight: 700; color: #111827; line-height: 1.2;">
            ${clientName}
          </div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 6px;">
            ${periodLabel} &nbsp;·&nbsp; ${dateRange}
          </div>
        </div>
        <div style="text-align: right;">
          ${logoSrc
            ? `<img src="${logoSrc}" alt="${agencyName}" style="height: 32px; width: auto; object-fit: contain; display: block; margin-left: auto; margin-bottom: 8px;" />`
            : agencyName
              ? `<span style="font-size: 15px; font-weight: 600; color: #111827; display: block; margin-bottom: 8px;">${agencyName}</span>`
              : ''
          }
          <div style="font-size: 11px; color: #9ca3af;">Gerado em ${now}</div>
        </div>
      </div>
    `
    content.prepend(pdfHeader)

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#f9fafb',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2
      const imgHeightTotal = (canvas.height * usableWidth) / canvas.width

      if (imgHeightTotal <= usableHeight) {
        pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeightTotal)
      } else {
        let offsetY = 0
        while (offsetY < imgHeightTotal) {
          if (offsetY > 0) pdf.addPage()
          pdf.addImage(imgData, 'PNG', margin, margin - offsetY, usableWidth, imgHeightTotal)
          offsetY += usableHeight
        }
      }

      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      const slug = clientName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
      pdf.save(`relatorio-${slug}-${date}.pdf`)

      setStatus('done')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('idle')
    } finally {
      document.getElementById('pdf-export-header')?.remove()
      if (controls) controls.style.display = ''
      if (titleSection) titleSection.style.display = ''
    }
  }

  return (
    <Button
      size="sm"
      className="gap-1.5 text-white border-0 hover:opacity-90 hover:text-white min-w-[160px] justify-center"
      style={{ backgroundColor: 'var(--agency-secondary)' }}
      onClick={handleExport}
      disabled={status === 'loading'}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando PDF...
        </>
      ) : status === 'done' ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          PDF baixado!
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </>
      )}
    </Button>
  )
}
