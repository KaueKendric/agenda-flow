import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, X } from 'lucide-react'
import { fetchAddressByCep } from '@/lib/viacep'
import { maskPhone, maskCPF, maskCEP, unmask } from '@/lib/mask'
import type { Client } from '@/types/clients'
import type { CreateClientInput, UpdateClientInput } from '@/lib/clients-api'

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSave: (data: CreateClientInput | UpdateClientInput) => Promise<void>
}

interface FormData {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  company: string
  zipCode: string
  address: string
  addressNumber: string
  city: string
  state: string
  notes: string
  tags: string[]
}

interface FormErrors {
  name?: string
  email?: string
  cpf?: string
  zipCode?: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  birthDate: '',
  company: '',
  zipCode: '',
  address: '',
  addressNumber: '',
  city: '',
  state: '',
  notes: '',
  tags: [],
}

export function ClientModal({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const isEditing = !!client

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone ? maskPhone(client.phone) : '',
        cpf: client.cpf ? maskCPF(client.cpf) : '',
        birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
        company: client.company || '',
        zipCode: client.zipCode ? maskCEP(client.zipCode) : '',
        address: client.address || '',
        addressNumber: client.addressNumber || '',
        city: client.city || '',
        state: client.state || '',
        notes: client.notes || '',
        tags: client.tags || [],
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
    setTagInput('')
  }, [client, open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.cpf && unmask(formData.cpf).length !== 11) {
      newErrors.cpf = 'CPF inválido'
    }

    if (formData.zipCode && unmask(formData.zipCode).length !== 8) {
      newErrors.zipCode = 'CEP inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCepSearch = async () => {
    const cleanCep = unmask(formData.zipCode)
    if (cleanCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const address = await fetchAddressByCep(cleanCep)
      if (address) {
        setFormData((prev) => ({
          ...prev,
          address: address.logradouro || prev.address,
          city: address.localidade || prev.city,
          state: address.uf || prev.state,
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setIsLoadingCep(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const data: CreateClientInput | UpdateClientInput = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: unmask(formData.phone) || undefined,
        cpf: unmask(formData.cpf) || undefined,
         birthDate: formData.birthDate 
          ? new Date(formData.birthDate).toISOString() 
          : undefined,
        company: formData.company || undefined,
        address: formData.address || undefined,
        addressNumber: formData.addressNumber || undefined,
        city: formData.city || undefined,
        state: formData.state.toUpperCase() || undefined,
        zipCode: unmask(formData.zipCode) || undefined,
        notes: formData.notes || undefined,
        tags: formData.tags,
      }

      await onSave(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    let maskedValue = value

    // Aplicar máscaras
    if (name === 'phone') {
      maskedValue = maskPhone(value)
    } else if (name === 'cpf') {
      maskedValue = maskCPF(value)
    } else if (name === 'zipCode') {
      maskedValue = maskCEP(value)
    }

    setFormData((prev) => ({ ...prev, [name]: maskedValue }))
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do cliente.'
              : 'Preencha os dados para criar um novo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="João Silva"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="joao@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Telefone e CPF */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && (
                <p className="text-xs text-destructive">{errors.cpf}</p>
              )}
            </div>
          </div>

          {/* Data Nascimento e Empresa */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          {/* CEP com busca */}
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                onBlur={handleCepSearch}
                placeholder="00000-000"
                className={errors.zipCode ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCepSearch}
                disabled={isLoadingCep || unmask(formData.zipCode).length !== 8}
              >
                {isLoadingCep ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.zipCode && (
              <p className="text-xs text-destructive">{errors.zipCode}</p>
            )}
          </div>

          {/* Endereço e Número */}
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, avenida..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNumber">Número</Label>
              <Input
                id="addressNumber"
                name="addressNumber"
                value={formData.addressNumber}
                onChange={handleChange}
                placeholder="123"
              />
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="São Paulo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tagInput">Tags (VIP, Regular, etc)</Label>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Digite e pressione Enter"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o cliente..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
