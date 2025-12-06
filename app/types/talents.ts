// Talents showcase system TypeScript types

export interface TalentsCategory {
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

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface Talent {
  id: number;
  category_id: number | null;
  name_uk: string;
  name_en: string;
  title_uk: string | null;
  title_en: string | null;
  bio_uk: string;
  bio_en: string;
  achievements_uk: string | null;
  achievements_en: string | null;
  photo_url: string | null;
  additional_photos: string[] | null;
  video_url: string | null;
  website_url: string | null;
  social_links: SocialLinks | null;
  birth_year: number | null;
  nationality: string | null;
  location: string | null;
  is_featured: boolean;
  view_count: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  category?: TalentsCategory;
}

export interface CreateTalentData {
  category_id?: number;
  name_uk: string;
  name_en: string;
  title_uk?: string;
  title_en?: string;
  bio_uk: string;
  bio_en: string;
  achievements_uk?: string;
  achievements_en?: string;
  photo_url?: string;
  additional_photos?: string[];
  video_url?: string;
  website_url?: string;
  social_links?: SocialLinks;
  birth_year?: number;
  nationality?: string;
  location?: string;
  is_featured?: boolean;
  uploaded_by: string;
}

export interface UpdateTalentData {
  category_id?: number;
  name_uk?: string;
  name_en?: string;
  title_uk?: string;
  title_en?: string;
  bio_uk?: string;
  bio_en?: string;
  achievements_uk?: string;
  achievements_en?: string;
  photo_url?: string;
  additional_photos?: string[];
  video_url?: string;
  website_url?: string;
  social_links?: SocialLinks;
  birth_year?: number;
  nationality?: string;
  location?: string;
  is_featured?: boolean;
}