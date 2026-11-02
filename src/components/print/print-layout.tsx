'use client'

import { useStore } from '@/store/app-store'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PatientLite = {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  phone: string
}

export function PrintLayout({
  title,
  patient,
  doctorName,
  doctorLicense,
  doctorCareer,
  children,
}: {
  title: string
  patient: PatientLite
  doctorName?: string
  doctorLicense?: string
  doctorCareer?: string
  children: React.ReactNode
}) {
  const { clinic } = useStore()

  function handlePrint() {
    // Render the printable content into a hidden container then print
    const printHost = document.getElementById('print-host')
    if (!printHost) return
    printHost.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.className = 'print-area'
    wrapper.innerHTML = renderHTML()
    printHost.appendChild(wrapper)
    window.print()
    // Cleanup after print
    setTimeout(() => {
      if (printHost) printHost.innerHTML = ''
    }, 500)
  }

  function renderHTML(): string {
    const patientAge = (() => {
      const d = new Date(patient.birthDate)
      if (isNaN(d.getTime())) return ''
      const diff = Date.now() - d.getTime()
      const ageDate = new Date(diff)
      return `${Math.abs(ageDate.getUTCFullYear() - 1970)} años`
    })()
    const today = new Date().toLocaleDateString('es-MX')
    return `
      <div style="font-family: Inter, Arial, sans-serif; color: #111; padding: 24px;">
        <div style="display:flex; align-items:center; gap:16px; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
          ${clinic?.logoUrl ? `<img src="${escapeHtml(clinic.logoUrl)}" alt="logo" style="width:60px;height:60px;object-fit:contain;" />` : `<div style="width:60px;height:60px;background:#0d9488;color:white;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:24px;font-weight:bold;">CSF</div>`}
          <div style="flex:1;">
            <div style="font-size: 20px; font-weight: 700; color: #0d9488;">${escapeHtml(clinic?.name || 'Clínica')}</div>
            <div style="font-size: 12px; color: #555;">${escapeHtml(clinic?.address || '')}</div>
            <div style="font-size: 12px; color: #555;">Tel: ${escapeHtml(clinic?.phone || '')} ${clinic?.email ? ` · ${escapeHtml(clinic.email)}` : ''}</div>
            ${clinic?.rfc ? `<div style="font-size: 12px; color: #555;">RFC: ${escapeHtml(clinic.rfc)}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 600; color:#0d9488;">${escapeHtml(title)}</div>
            <div style="font-size: 12px; color: #555;">Fecha: ${today}</div>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap: 8px 24px; font-size: 13px; margin-bottom: 16px; padding: 10px; background: #f8fafc; border-radius: 6px;">
          <div><b>Paciente:</b> ${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</div>
          <div><b>Edad:</b> ${patientAge}</div>
          <div><b>Sexo:</b> ${patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}</div>
          <div><b>Tel:</b> ${escapeHtml(patient.phone)}</div>
        </div>

        <div style="font-size: 13px; line-height: 1.6;">${childrenAsHTML()}</div>

        <div style="margin-top: 64px; display:flex; justify-content:space-between; font-size: 12px;">
          <div style="text-align:center;">
            <div style="border-top: 1px solid #333; width: 220px; padding-top: 4px;">${escapeHtml(doctorName || '')}</div>
            <div style="color: #555;">${doctorCareer ? escapeHtml(doctorCareer) : ''}</div>
            ${doctorLicense ? `<div style="color: #555;">Céd. prof.: ${escapeHtml(doctorLicense)}</div>` : ''}
          </div>
          <div style="text-align:center;">
            <div style="border-top: 1px solid #333; width: 220px; padding-top: 4px;">Firma del paciente</div>
          </div>
        </div>
      </div>
    `
  }

  function childrenAsHTML(): string {
    // Convert React children to HTML string by serializing through a temporary element
    if (typeof window === 'undefined') return ''
    const tmp = document.createElement('div')
    // Use ReactDOMServer-free approach: clone children via React.createElement to string
    // Simpler: render the children into a detached container using React
    return serializeReact(children)
  }

  function serializeReact(node: React.ReactNode): string {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node === 'string') return escapeHtml(node)
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(serializeReact).join('')
    if (typeof node === 'object' && 'props' in node) {
      const el = node as React.ReactElement
      const tag = (el.type as string) || 'div'
      if (typeof el.type !== 'string') {
        // functional component — fall back to children
        return serializeReact((el.props as any)?.children)
      }
      const styleAttr = (el.props as any)?.style ? ` style="${styleToString((el.props as any).style)}"` : ''
      const classAttr = (el.props as any)?.className ? ` class="${(el.props as any).className}"` : ''
      const children = serializeReact((el.props as any)?.children)
      const selfClosing = ['br', 'hr', 'img'].includes(tag)
      return selfClosing ? `<${tag}${styleAttr}${classAttr} />` : `<${tag}${styleAttr}${classAttr}>${children}</${tag}>`
    }
    return ''
  }

  function styleToString(style: any): string {
    return Object.entries(style || {}).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`).join(';')
  }

  function escapeHtml(s: string): string {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
  }

  return (
    <>
      <Button variant="outline" size="sm" className="no-print" onClick={handlePrint}>
        <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir
      </Button>
      <div id="print-host" style={{ display: 'none' }} />
    </>
  )
}
