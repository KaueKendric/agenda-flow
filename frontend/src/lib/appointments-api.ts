import { env } from '@/config/env';

const API_URL = `${env.apiUrl}/appointments`;

export const appointmentsApi = {
  async updateStatus(appointmentId: string, status: string) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar status');
    }

    return response.json();
  },
};
