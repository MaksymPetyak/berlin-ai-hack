// Define possible value types for custom fields
export type CustomFieldValue = string | number | boolean | Date;

// Define the structure of a custom field
export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    value: CustomFieldValue;
}

export interface UserProfile {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    birthday?: string;
    custom_fields: Record<string, CustomField>;
    updated_at?: string;
    created_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface UploadResponse {
  success: boolean;
  documentId?: string;
  error?: string;
} 