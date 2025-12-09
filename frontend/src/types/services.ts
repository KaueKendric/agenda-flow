export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  professionalId?: string;
  professional?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  duration: number;
  price: number;
  professionalId?: string | null;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  professionalId?: string | null;
}

// Categorias sugeridas 
export const SERVICE_CATEGORIES = [
  'Corte',
  'Coloração',
  'Barba',
  'Manicure',
  'Pedicure',
  'Hidratação',
  'Luzes',
  'Alisamento',
  'Depilação',
  'Maquiagem',
  'Design de Sobrancelhas',
  'Massagem',
  'Outro',
] as const;
