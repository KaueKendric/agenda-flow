export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
} as const;

if (!env.apiUrl) {
  throw new Error('VITE_API_URL não está definida no .env');
}
