const API_BASE = 'http://localhost:5000/api';
export const BACKEND_URL = 'http://localhost:5000';

/**
 * Chuyển đổi đường dẫn ảnh tương đối thành URL đầy đủ từ backend
 * VD: '/uploads/images/products/s24utral.webp' -> 'http://localhost:5000/uploads/images/products/s24utral.webp'
 */
export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Encode từng segment của path để xử lý tên file có dấu cách, ký tự đặc biệt
  const encodedPath = url
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  return `${BACKEND_URL}${encodedPath}`;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Gửi cookie JWT
    ...options,
  };

  // Thêm token từ localStorage vào header (backup nếu cookie không hoạt động)
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint),

  post: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export default api;
