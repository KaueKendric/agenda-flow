import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { professionalsApi } from '@/lib/professionals-api'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { Professional, WorkSchedule } from '@/types/professionals'

interface WorkScheduleTabProps {
  professional: Professional | null
  loading: boolean
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<typeof DAYS[number], string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export function WorkScheduleTab({ professional, loading }: WorkScheduleTabProps) {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<WorkSchedule>(professional?.workSchedule || {})
  const [saving, setSaving] = useState(false)

  const toggleDay = (day: typeof DAYS[number]) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day]
        ? { ...prev[day], enabled: !prev[day]?.enabled }
        : { enabled: true, shifts: [{ start: '09:00', end: '18:00' }] },
    }))
  }

  const updateShift = (day: typeof DAYS[number], shiftIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: (prev[day]?.shifts || []).map((shift, idx) =>
          idx === shiftIndex ? { ...shift, [field]: value } : shift
        ),
      },
    }))
  }

  const addShift = (day: typeof DAYS[number]) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: [...(prev[day]?.shifts || []), { start: '09:00', end: '18:00' }],
      },
    }))
  }

  const removeShift = (day: typeof DAYS[number], shiftIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: (prev[day]?.shifts || []).filter((_, idx) => idx !== shiftIndex),
      },
    }))
  }

  const handleSave = async () => {
    if (!professional) {
      toast({
        title: 'Erro',
        description: 'Profissional não encontrado.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await professionalsApi.updateWorkSchedule(professional.id, schedule)

      toast({
        title: 'Sucesso',
        description: 'Horários de trabalho atualizados com sucesso.',
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar horários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os horários.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Trabalho</CardTitle>
        <CardDescription>Configure seus horários de funcionamento por dia da semana</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {DAYS.map((day) => {
          const daySchedule = schedule[day]
          const isEnabled = daySchedule?.enabled ?? false
          const shifts = daySchedule?.shifts || []

          return (
            <div key={day} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={day}
                  checked={isEnabled}
                  onCheckedChange={() => toggleDay(day)}
                />
                <Label htmlFor={day} className="font-medium cursor-pointer flex-1 m-0">
                  {DAY_LABELS[day]}
                </Label>
              </div>

              {isEnabled && (
                <div className="space-y-3 ml-6">
                  {shifts.map((shift, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">De</Label>
                        <Input
                          type="time"
                          value={shift.start}
                          onChange={(e) => updateShift(day, idx, 'start', e.target.value)}
                        />
                      </div>

                      <div className="flex-1">
                        <Label className="text-xs">Até</Label>
                        <Input
                          type="time"
                          value={shift.end}
                          onChange={(e) => updateShift(day, idx, 'end', e.target.value)}
                        />
                      </div>

                      {shifts.length > 1 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeShift(day, idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addShift(day)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar turno
                  </Button>
                </div>
              )}
            </div>
          )
        })}

        <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Horários'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
