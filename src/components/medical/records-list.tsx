'use client'

import { useStore } from '@/store/app-store'
import { useApi } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { FileText } from 'lucide-react'

type Record = {
  id: string
  date: string
  chiefComplaint: string
  diagnosis: string
  recordType?: string
  patient: { id: string; firstName: string; lastName: string }
  doctor: { doctorProfile?: { fullName: string; specialty: string | null } | null; email: string }
}

export function MedicalRecordsList() {
  const { user, selectPatient } = useStore()
  const { data, isLoading } = useApi<Record[]>(['medical-records-list'], '/api/medical-records')

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Expedientes clínicos</h1>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'COORDINATOR' ? 'Todos los expedientes médicos' : 'Tus expedientes clínicos'}
        </p>
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
                  <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                  <TableHead className="hidden lg:table-cell">Diagnóstico</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{formatDateTime(r.date)}</TableCell>
                    <TableCell>
                      <button onClick={() => selectPatient(r.patient.id)} className="font-medium hover:underline">
                        {r.patient.firstName} {r.patient.lastName}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {r.doctor?.doctorProfile?.fullName || r.doctor?.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{r.chiefComplaint}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{r.diagnosis}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => selectPatient(r.patient.id)}>
                        <FileText className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin expedientes registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function DentalRecordsList() {
  const { user, selectPatient } = useStore()
  const { data, isLoading } = useApi<Record[]>(['dental-records-list'], '/api/dental-records')

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Expedientes dentales</h1>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'COORDINATOR' ? 'Todos los expedientes dentales' : 'Tus expedientes dentales con odontograma'}
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : data && data.length > 0 ? (
            <Table>
              <Header />
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{formatDateTime(r.date)}</TableCell>
                    <TableCell>
                      <button onClick={() => selectPatient(r.patient.id)} className="font-medium hover:underline">
                        {r.patient.firstName} {r.patient.lastName}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {r.doctor?.doctorProfile?.fullName || r.doctor?.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{r.chiefComplaint}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{r.diagnosis}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => selectPatient(r.patient.id)}>
                        <FileText className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin expedientes registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Header() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Fecha</TableHead>
        <TableHead>Paciente</TableHead>
        <TableHead className="hidden md:table-cell">Odontólogo</TableHead>
        <TableHead className="hidden lg:table-cell">Motivo</TableHead>
        <TableHead className="hidden lg:table-cell">Diagnóstico</TableHead>
        <TableHead className="text-right">Acción</TableHead>
      </TableRow>
    </TableHeader>
  )
}
