// Archive system TypeScript types

export interface ArchiveCategory {
  id: number;
  name_uk: string;
  name_en: string;
  description_uk: string | null;
  description_en: string | null;
  slug: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArchiveDocument {
  id: number;
  category_id: number | null;
  title_uk: string;
  title_en: string;
  description_uk: string | null;
  description_en: string | null;
  document_url: string | null;
  document_filename: string | null;
  document_type: 'pdf' | 'doc' | 'docx' | 'txt' | null;
  image_url: string | null;
  author: string | null;
  publication_date: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  category?: ArchiveCategory;
}

export interface CreateArchiveDocumentData {
  category_id?: number;
  title_uk: string;
  title_en: string;
  description_uk?: string;
  description_en?: string;
  document_url?: string;
  document_filename?: string;
  document_type?: 'pdf' | 'doc' | 'docx' | 'txt';
  image_url?: string;
  author?: string;
  publication_date?: string;
  file_size?: number;
  uploaded_by: string;
  is_featured?: boolean;
}

export interface UpdateArchiveDocumentData {
  category_id?: number;
  title_uk?: string;
  title_en?: string;
  description_uk?: string;
  description_en?: string;
  document_url?: string;
  document_filename?: string;
  document_type?: 'pdf' | 'doc' | 'docx' | 'txt';
  image_url?: string;
  author?: string;
  publication_date?: string;
  file_size?: number;
  is_featured?: boolean;
}