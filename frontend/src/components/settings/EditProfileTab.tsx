import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { usersApi } from '@/lib/users-api'
import { authService } from '@/lib/api'
import { Upload, Loader2, User } from 'lucide-react'
import { AxiosError } from 'axios'
import type { UserProfile } from '@/lib/users-api'

interface EditProfileTabProps {
  user: { name?: string; email: string; role: string } | null
  loading: boolean
}

export function EditProfileTab({ user, loading }: EditProfileTabProps) {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersApi.getProfile()
        setProfile(data)
        setFormData({ name: data.name || '', email: data.email })
      } catch (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o perfil.',
          variant: 'destructive',
        })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedMimes.includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas.',
        variant: 'destructive',
      })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Erro',
        description: 'Arquivo muito grande. Máximo 5MB.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const response = await usersApi.uploadAvatar(file)
      setProfile(response.user)

      // Atualizar localStorage com nova imagem
      const currentUser = authService.getStoredUser()
      if (currentUser) {
        authService.setStoredUser({ ...currentUser, image: response.user.image })
      }

      toast({
        title: 'Sucesso',
        description: response.message || 'Avatar atualizado com sucesso.',
      })
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      
      let errorMessage = 'Não foi possível fazer upload do avatar.'
      
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      // Limpar input
      e.target.value = ''
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite seu nome completo.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite seu email.',
        variant: 'destructive',
      })
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Erro',
        description: 'Email inválido.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const updatedProfile = await usersApi.updateProfile({
        name: formData.name,
        email: formData.email,
      })
      setProfile(updatedProfile)

      // Atualizar localStorage
      const currentUser = authService.getStoredUser()
      if (currentUser) {
        authService.setStoredUser({
          ...currentUser,
          name: updatedProfile.name,
          email: updatedProfile.email,
        })
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso.',
      })
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error)
      
      let errorMessage = 'Não foi possível atualizar o perfil.'
      
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'
const avatarUrl = profile?.image
  ? `${API_BASE.replace('/api', '')}${profile.image}`
  : null

  return (
    <div className="space-y-6">
      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Atualize sua foto de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden border-4 border-border shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', avatarUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <User className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            {/* Upload Input */}
            <div className="w-full max-w-xs">
              <input
                id="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
              />
              <Label htmlFor="avatar-input">
                <Button
                  asChild
                  disabled={uploading}
                  className="w-full cursor-pointer"
                  variant="outline"
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Clique para upload ou arraste uma imagem
                      </>
                    )}
                  </span>
                </Button>
              </Label>
            </div>
            <p className="text-xs text-muted-foreground text-center">PNG, JPG ou 5MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Input
                id="role"
                value={profile?.role || user?.role || 'Usuário'}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
