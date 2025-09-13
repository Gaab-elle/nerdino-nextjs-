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
});

// Internal Models
export type ExternalJobDTO = z.infer<typeof ExternalJobSchema>;

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

// Type Guards
export function isExternalJob(obj: unknown): obj is ExternalJobDTO {
  return ExternalJobSchema.safeParse(obj).success;
}

// Normalization function
export function normalizeOpportunity(raw: unknown): Opportunity | null {
  const parsed = ExternalJobSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn('Invalid opportunity data:', parsed.error);
    return null;
  }

  const job = parsed.data;
  
  // Extract salary information
  let salary: { min: number; max: number } | undefined;
  if (typeof job.salary === 'string') {
    // Parse salary string (e.g., "R$ 5.000 - R$ 8.000")
    const numbers = job.salary.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      salary = {
        min: parseInt(numbers[0]) * 1000, // Assuming format like "5.000"
        max: parseInt(numbers[1]) * 1000,
      };
    }
  } else if (job.salary && typeof job.salary === 'object') {
    salary = {
      min: job.salary.min || 0,
      max: job.salary.max || 0,
    };
  }

  // Extract technologies
  const technologies = job.technologies || [];
  if (job.contents) {
    // Extract technologies from content
    const techKeywords = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript'];
    const foundTechs = techKeywords.filter(tech => 
      job.contents!.toLowerCase().includes(tech.toLowerCase())
    );
    technologies.push(...foundTechs);
  }

  // Determine experience level
  const experience = determineExperienceLevel(job.contents || job.description || '');

  // Calculate if job is new
  const postedDate = job.publication_date || job.posted_at;
  const isNew = postedDate ? 
    (Date.now() - new Date(postedDate).getTime()) < 7 * 24 * 60 * 60 * 1000 : 
    false;

  return {
    id: job.id.toString(),
    title: job.title,
    company: job.company?.name || 'Empresa',
    companyLogo: job.company?.logo_url,
    location: job.locations?.[0]?.name || 'Remoto',
    remote: job.locations?.[0]?.name?.toLowerCase().includes('remote') || false,
    salary,
    experience,
    contractType: job.type || 'CLT',
    technologies: [...new Set(technologies)], // Remove duplicates
    description: (job.contents || job.description || '').substring(0, 200) + '...',
    postedAt: postedDate ? new Date(postedDate).toLocaleDateString('pt-BR') : 'Data não disponível',
    isNew,
    isUrgent: false,
    matchScore: 75, // Will be calculated based on user skills
    matchBreakdown: {
      skills: 75,
      experience: 85,
      location: 90,
    },
    url: `https://example.com/jobs/${job.id}`,
    userApplied: false,
    userFavorited: false,
  };
}

function determineExperienceLevel(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('senior') || lowerText.includes('sênior')) return 'senior';
  if (lowerText.includes('pleno') || lowerText.includes('mid-level')) return 'pleno';
  if (lowerText.includes('junior') || lowerText.includes('júnior') || lowerText.includes('entry')) return 'junior';
  return 'pleno'; // Default
}
