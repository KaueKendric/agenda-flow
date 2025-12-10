import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { usersApi } from '@/lib/professionals-api'
import { Loader2, AlertCircle } from 'lucide-react'

export function ChangePasswordTab() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'newPassword') {
      calculatePasswordStrength(value)
    }
  }

  const handleChangePassword = async () => {
    // Validações
    if (!formData.currentPassword) {
      toast({
        title: 'Erro',
        description: 'Digite sua senha atual.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.newPassword) {
      toast({
        title: 'Erro',
        description: 'Digite uma nova senha.',
        variant: 'destructive',
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no mínimo 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não correspondem.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      await usersApi.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso.',
      })

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordStrength(0)
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a senha.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const strengthLabels = ['Fraca', 'Razoável', 'Boa', 'Forte']
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha Atual</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="Digite sua senha atual"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Digite uma nova senha"
          />

          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Força da senha:</span>
                <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Muito fraca'}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColors[passwordStrength - 1] || 'bg-red-500'} transition-all`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirme a nova senha"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2 text-sm">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Requisitos de senha:</p>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 text-xs mt-1 space-y-1">
              <li>Mínimo 8 caracteres</li>
              <li>Letras maiúsculas e minúsculas</li>
              <li>Números</li>
              <li>Caracteres especiais (@$!%*?&)</li>
            </ul>
          </div>
        </div>

        <Button onClick={handleChangePassword} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Alterando...
            </>
          ) : (
            'Alterar Senha'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
