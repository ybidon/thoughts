declare module '@vercel/blob' {
  export function del(url: string): Promise<void>;
  export function put(
    name: string,
    file: File,
    options?: { access?: 'public' | 'private' }
  ): Promise<{ url: string }>;
} 