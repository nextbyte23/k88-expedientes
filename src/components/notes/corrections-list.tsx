'use client'

import { useApi } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/format'
import { History } from 'lucide-react'

const RECORD_TYPES: Record<string, string> = {
  MEDICAL_RECORD: 'Expediente médico',
  DENTAL_RECORD: 'Expediente dental',
  EVOLUTION_NOTE: 'Nota de evolución',
  PRESCRIPTION: 'Receta',
}

type Log = {
  id: string
  recordType: string
  recordId: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  reason: string | null
  correctedAt: string
  user: { email: string; doctorProfile?: { fullName: string } | null }
}

export function CorrectionsList() {
  const { data: logs, isLoading } = useApi<Log[]>(['correction-logs'], '/api/correction-logs')

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Historial de correcciones</h1>
        <p className="text-sm text-muted-foreground">
          Auditoría interna — no aparece en documentos impresos
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead className="hidden md:table-cell">Valor anterior</TableHead>
                  <TableHead className="hidden md:table-cell">Valor nuevo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs">{formatDateTime(l.correctedAt)}</TableCell>
                    <TableCell><Badge variant="outline">{RECORD_TYPES[l.recordType] || l.recordType}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{l.fieldName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs max-w-xs truncate text-muted-foreground">{l.oldValue || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs max-w-xs truncate">{l.newValue || '—'}</TableCell>
                    <TableCell className="text-xs">{l.user?.doctorProfile?.fullName || l.user?.email}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{l.reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Sin correcciones registradas</p>
              <p className="text-xs mt-1">Cuando un médico corrige un expediente, nota o receta, el cambio queda aquí.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
