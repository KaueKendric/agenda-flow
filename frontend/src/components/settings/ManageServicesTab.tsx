import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { servicesApi } from '@/lib/services-api'
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Service } from '@/types/services'

interface ManageServicesTabProps {
  loading: boolean
}

interface ServiceForm {
  name: string
  description: string
  duration: number
  price: number
}

const initialFormState: ServiceForm = {
  name: '',
  description: '',
  duration: 60,
  price: 0,
}

export function ManageServicesTab({ loading }: ManageServicesTabProps) {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState<ServiceForm>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchServices = useCallback(async () => {
    try {
      const data = await servicesApi.list()
      setServices(data)
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços.',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value,
    }))
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: 'Erro',
        description: 'Digite o nome do serviço.',
        variant: 'destructive',
      })
      return
    }

    if (formData.duration < 15) {
      toast({
        title: 'Erro',
        description: 'A duração mínima é 15 minutos.',
        variant: 'destructive',
      })
      return
    }

    if (formData.price < 0) {
      toast({
        title: 'Erro',
        description: 'O preço não pode ser negativo.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await servicesApi.update(editingId, formData)
        toast({
          title: 'Sucesso',
          description: 'Serviço atualizado com sucesso.',
        })
      } else {
        await servicesApi.create(formData)
        toast({
          title: 'Sucesso',
          description: 'Serviço criado com sucesso.',
        })
      }

      setFormData(initialFormState)
      setEditingId(null)
      setOpen(false)
      await fetchServices()
    } catch (error) {
      console.error('❌ Erro ao salvar serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o serviço.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    })
    setEditingId(service.id)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este serviço?')) {
      return
    }

    try {
      await servicesApi.delete(id)
      toast({
        title: 'Sucesso',
        description: 'Serviço deletado com sucesso.',
      })
      await fetchServices()
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o serviço.',
        variant: 'destructive',
      })
    }
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setFormData(initialFormState)
    setEditingId(null)
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gerenciar Serviços</CardTitle>
            <CardDescription>Crie, edite ou delete seus serviços</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Atualize os dados do serviço' : 'Adicione um novo serviço à sua lista'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Nome do Serviço</Label>
                  <Input
                    id="service-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Corte de Cabelo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-description">Descrição (Opcional)</Label>
                  <Textarea
                    id="service-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição do serviço..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-duration">Duração (minutos)</Label>
                    <Input
                      id="service-duration"
                      name="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-price">Preço (R$)</Label>
                    <Input
                      id="service-price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Serviço'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum serviço cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>⏱️ {service.duration} min</span>
                      <span>💰 R$ {service.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
