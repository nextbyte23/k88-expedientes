'use client'

import { useStore } from '@/store/app-store'
import { useApi } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { FileText } from 'lucide-react'

type Note = {
  id: string
  date: string
  note: string
  treatment: string | null
  patient: { id: string; firstName: string; lastName: string }
  doctor: { doctorProfile?: { fullName: string; specialty: string | null } | null; email: string }
}

export function EvolutionNotesList() {
  const { selectPatient } = useStore()
  const { data, isLoading } = useApi<Note[]>(['evolution-notes-list'], '/api/evolution-notes')

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Notas de evolución</h1>
        <p className="text-sm text-muted-foreground">Notas de evolución (NOM-004)</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Médico</TableHead>
                  <TableHead className="hidden lg:table-cell">Nota</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-xs">{formatDateTime(n.date)}</TableCell>
                    <TableCell>
                      <button onClick={() => selectPatient(n.patient.id)} className="font-medium hover:underline">
                        {n.patient.firstName} {n.patient.lastName}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {n.doctor?.doctorProfile?.fullName || n.doctor?.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs max-w-xs truncate">{n.note}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => selectPatient(n.patient.id)}>
                        <FileText className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin notas de evolución</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type Prescription = {
  id: string
  date: string
  diagnosis: string
  indications: string | null
  patient: { id: string; firstName: string; lastName: string }
  doctor: { doctorProfile?: { fullName: string; specialty: string | null } | null; email: string }
  items: Array<{ id: string; medicationName: string; dose: string; frequency: string; route: string }>
}

export function PrescriptionsList() {
  const { selectPatient } = useStore()
  const { data, isLoading } = useApi<Prescription[]>(['prescriptions-list'], '/api/prescriptions')

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Recetas</h1>
        <p className="text-sm text-muted-foreground">Recetas médicas emitidas</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Médico</TableHead>
                  <TableHead className="hidden lg:table-cell">Diagnóstico</TableHead>
                  <TableHead className="hidden lg:table-cell">Medicamentos</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{formatDateTime(p.date)}</TableCell>
                    <TableCell>
                      <button onClick={() => selectPatient(p.patient.id)} className="font-medium hover:underline">
                        {p.patient.firstName} {p.patient.lastName}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {p.doctor?.doctorProfile?.fullName || p.doctor?.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{p.diagnosis}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{p.items.length}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => selectPatient(p.patient.id)}>
                        <FileText className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin recetas registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
