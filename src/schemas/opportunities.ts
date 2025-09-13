import { z } from "zod";

// External API Schemas (from job boards)
export const ExternalJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  company: z.object({
    name: z.string(),
    logo_url: z.string().optional(),
  }).optional(),
  locations: z.array(z.object({
    name: z.string(),
  })).optional(),
  salary: z.union([
    z.string(),
    z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
  ]).optional(),
  type: z.string().optional(),
  contents: z.string().optional(),
  description: z.string().optional(),
  publication_date: z.string().optional(),
  posted_at: z.string().optional(),
  requirements: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
  remote: z.boolean().optional(),
  experience_level: z.string().optional(),
  contract_type: z.string().optional(),
});

// Internal Opportunity Schema
export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  companyLogo: z.string().optional(),
  location: z.string(),
  remote: z.boolean(),
  salary: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  experience: z.string(),
  contractType: z.string(),
  technologies: z.array(z.string()),
  description: z.string(),
  postedAt: z.string(),
  isNew: z.boolean(),
  isUrgent: z.boolean(),
  matchScore: z.number(),
  matchBreakdown: z.object({
    skills: z.number(),
    experience: z.number(),
    location: z.number(),
  }),
  url: z.string(),
  userApplied: z.boolean(),
  userFavorited: z.boolean(),
});

// Database Opportunity Schema (Prisma)
export const DatabaseOpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  remote: z.boolean(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  experience_level: z.string(),
  contract_type: z.string(),
  technologies: z.array(z.string()),
  description: z.string(),
  requirements: z.string().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_urgent: z.boolean(),
  views_count: z.number(),
  applications_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  posted_at: z.string(),
  expires_at: z.string().nullable(),
  company_logo_url: z.string().nullable(),
  external_url: z.string().nullable(),
  source: z.string(),
  external_id: z.string().nullable(),
});

// Application Schema
export const ApplicationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  opportunity_id: z.string(),
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  cover_letter: z.string().optional(),
  resume_url: z.string().optional(),
  applied_at: z.string(),
  updated_at: z.string(),
});

// Favorite Schema
export const FavoriteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  opportunity_id: z.string(),
  created_at: z.string(),
});

// DTOs (Data Transfer Objects)
export type ExternalJobDTO = z.infer<typeof ExternalJobSchema>;
export type OpportunityDTO = z.infer<typeof OpportunitySchema>;
export type DatabaseOpportunityDTO = z.infer<typeof DatabaseOpportunitySchema>;
export type ApplicationDTO = z.infer<typeof ApplicationSchema>;
export type FavoriteDTO = z.infer<typeof FavoriteSchema>;

// Internal Models (normalized)
export type Opportunity = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
  };
  experience: string;
  contractType: string;
  technologies: string[];
  description: string;
  postedAt: string;
  isNew: boolean;
  isUrgent: boolean;
  matchScore: number;
  matchBreakdown: {
    skills: number;
    experience: number;
    location: number;
  };
  url: string;
  userApplied: boolean;
  userFavorited: boolean;
};

export type Application = {
  id: string;
  userId: string;
  opportunityId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
};

export type Favorite = {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
};

// Type Guards
export function isExternalJob(obj: unknown): obj is ExternalJobDTO {
  return ExternalJobSchema.safeParse(obj).success;
}

export function isOpportunity(obj: unknown): obj is OpportunityDTO {
  return OpportunitySchema.safeParse(obj).success;
}

export function isDatabaseOpportunity(obj: unknown): obj is DatabaseOpportunityDTO {
  return DatabaseOpportunitySchema.safeParse(obj).success;
}

export function isApplication(obj: unknown): obj is ApplicationDTO {
  return ApplicationSchema.safeParse(obj).success;
}

export function isFavorite(obj: unknown): obj is FavoriteDTO {
  return FavoriteSchema.safeParse(obj).success;
}

// Validation helpers
export function validateExternalJob(data: unknown): ExternalJobDTO {
  const result = ExternalJobSchema.safeParse(data);
  if (!result.success) {
    console.error('External job validation failed:', result.error);
    throw new Error('Invalid external job data');
  }
  return result.data;
}

export function validateOpportunity(data: unknown): OpportunityDTO {
  const result = OpportunitySchema.safeParse(data);
  if (!result.success) {
    console.error('Opportunity validation failed:', result.error);
    throw new Error('Invalid opportunity data');
  }
  return result.data;
}

export function validateDatabaseOpportunity(data: unknown): DatabaseOpportunityDTO {
  const result = DatabaseOpportunitySchema.safeParse(data);
  if (!result.success) {
    console.error('Database opportunity validation failed:', result.error);
    throw new Error('Invalid database opportunity data');
  }
  return result.data;
}

export function validateApplication(data: unknown): ApplicationDTO {
  const result = ApplicationSchema.safeParse(data);
  if (!result.success) {
    console.error('Application validation failed:', result.error);
    throw new Error('Invalid application data');
  }
  return result.data;
}

export function validateFavorite(data: unknown): FavoriteDTO {
  const result = FavoriteSchema.safeParse(data);
  if (!result.success) {
    console.error('Favorite validation failed:', result.error);
    throw new Error('Invalid favorite data');
  }
  return result.data;
}
