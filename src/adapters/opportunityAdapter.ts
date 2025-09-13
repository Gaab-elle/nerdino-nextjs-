import {
  ExternalJobDTO,
  DatabaseOpportunityDTO,
  ApplicationDTO,
  FavoriteDTO,
  Opportunity,
  Application,
  Favorite,
  validateExternalJob,
  validateDatabaseOpportunity,
  validateApplication,
  validateFavorite,
} from '@/schemas/opportunities';

export class OpportunityAdapter {
  /**
   * Normalize external job data from API response to internal model
   */
  static normalizeOpportunity(raw: unknown): Opportunity | null {
    try {
      const dto = validateExternalJob(raw);
      return this.createOpportunityFromExternal(dto);
    } catch (error) {
      console.warn('Invalid opportunity data:', error);
      return null;
    }
  }

  /**
   * Normalize database opportunity data to internal model
   */
  static normalizeDatabaseOpportunity(raw: unknown): Opportunity | null {
    try {
      const dto = validateDatabaseOpportunity(raw);
      return this.createOpportunityFromDatabase(dto);
    } catch (error) {
      console.warn('Invalid database opportunity data:', error);
      return null;
    }
  }

  /**
   * Normalize application data
   */
  static normalizeApplication(raw: unknown): Application | null {
    try {
      const dto = validateApplication(raw);
      return {
        id: dto.id,
        userId: dto.user_id,
        opportunityId: dto.opportunity_id,
        status: dto.status,
        coverLetter: dto.cover_letter,
        resumeUrl: dto.resume_url,
        appliedAt: dto.applied_at,
        updatedAt: dto.updated_at,
      };
    } catch (error) {
      console.warn('Invalid application data:', error);
      return null;
    }
  }

  /**
   * Normalize favorite data
   */
  static normalizeFavorite(raw: unknown): Favorite | null {
    try {
      const dto = validateFavorite(raw);
      return {
        id: dto.id,
        userId: dto.user_id,
        opportunityId: dto.opportunity_id,
        createdAt: dto.created_at,
      };
    } catch (error) {
      console.warn('Invalid favorite data:', error);
      return null;
    }
  }

  /**
   * Create opportunity from external job data
   */
  private static createOpportunityFromExternal(job: ExternalJobDTO): Opportunity {
    // Extract salary information
    const salary = this.extractSalary(job.salary);
    
    // Extract technologies
    const technologies = this.extractTechnologies(job);
    
    // Determine experience level
    const experience = this.determineExperienceLevel(job.contents || job.description || '');
    
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
      remote: job.remote ?? job.locations?.[0]?.name?.toLowerCase().includes('remote') ?? false,
      salary,
      experience,
      contractType: job.contract_type || job.type || 'CLT',
      technologies: [...new Set(technologies)], // Remove duplicates
      description: this.truncateDescription(job.contents || job.description || ''),
      postedAt: postedDate ? new Date(postedDate).toLocaleDateString('pt-BR') : 'Data não disponível',
      isNew,
      isUrgent: false,
      matchScore: 75, // Will be calculated based on user skills
      matchBreakdown: {
        skills: 75,
        experience: 85,
        location: 90,
      },
      url: job.url || `https://example.com/jobs/${job.id}`,
      userApplied: false,
      userFavorited: false,
    };
  }

  /**
   * Create opportunity from database data
   */
  private static createOpportunityFromDatabase(db: DatabaseOpportunityDTO): Opportunity {
    return {
      id: db.id,
      title: db.title,
      company: db.company,
      companyLogo: db.company_logo_url || undefined,
      location: db.location,
      remote: db.remote,
      salary: db.salary_min && db.salary_max ? {
        min: db.salary_min,
        max: db.salary_max,
      } : undefined,
      experience: db.experience_level,
      contractType: db.contract_type,
      technologies: db.technologies,
      description: this.truncateDescription(db.description),
      postedAt: new Date(db.posted_at).toLocaleDateString('pt-BR'),
      isNew: this.isJobNew(db.posted_at),
      isUrgent: db.is_urgent,
      matchScore: 75, // Will be calculated based on user skills
      matchBreakdown: {
        skills: 75,
        experience: 85,
        location: 90,
      },
      url: db.external_url || `/opportunities/${db.id}`,
      userApplied: false, // Will be set based on user data
      userFavorited: false, // Will be set based on user data
    };
  }

  /**
   * Extract salary information from various formats
   */
  private static extractSalary(salary: unknown): { min: number; max: number } | undefined {
    if (typeof salary === 'string') {
      // Parse salary string (e.g., "R$ 5.000 - R$ 8.000")
      const numbers = salary.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        return {
          min: parseInt(numbers[0]) * 1000, // Assuming format like "5.000"
          max: parseInt(numbers[1]) * 1000,
        };
      }
    } else if (salary && typeof salary === 'object' && 'min' in salary && 'max' in salary) {
      const salaryObj = salary as { min?: number; max?: number };
      return {
        min: salaryObj.min || 0,
        max: salaryObj.max || 0,
      };
    }
    return undefined;
  }

  /**
   * Extract technologies from job data
   */
  private static extractTechnologies(job: ExternalJobDTO): string[] {
    const technologies = job.technologies || [];
    
    if (job.contents) {
      // Extract technologies from content
      const techKeywords = [
        'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript',
        'Next.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'PHP', 'Ruby',
        'Go', 'Rust', 'C++', 'C#', 'Swift', 'Kotlin', 'Docker', 'Kubernetes',
        'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'GraphQL', 'REST', 'Microservices', 'CI/CD', 'Git', 'Linux'
      ];
      
      const foundTechs = techKeywords.filter(tech => 
        job.contents!.toLowerCase().includes(tech.toLowerCase())
      );
      technologies.push(...foundTechs);
    }
    
    return [...new Set(technologies)]; // Remove duplicates
  }

  /**
   * Determine experience level from text
   */
  private static determineExperienceLevel(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('senior') || lowerText.includes('sênior')) return 'senior';
    if (lowerText.includes('pleno') || lowerText.includes('mid-level')) return 'pleno';
    if (lowerText.includes('junior') || lowerText.includes('júnior') || lowerText.includes('entry')) return 'junior';
    return 'pleno'; // Default
  }

  /**
   * Check if job is new (posted within last 7 days)
   */
  private static isJobNew(postedAt: string): boolean {
    const postedDate = new Date(postedAt);
    const now = new Date();
    const diffTime = now.getTime() - postedDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 7;
  }

  /**
   * Truncate description to reasonable length
   */
  private static truncateDescription(description: string, maxLength: number = 200): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Calculate match score based on user skills and job requirements
   */
  static calculateMatchScore(
    userSkills: string[],
    jobTechnologies: string[],
    userExperience: string,
    jobExperience: string,
    userLocation: string,
    jobLocation: string
  ): { score: number; breakdown: { skills: number; experience: number; location: number } } {
    // Skills match (0-100)
    const skillMatches = userSkills.filter(skill => 
      jobTechnologies.some(tech => 
        tech.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(tech.toLowerCase())
      )
    ).length;
    const skillsScore = jobTechnologies.length > 0 ? 
      (skillMatches / jobTechnologies.length) * 100 : 0;

    // Experience match (0-100)
    const experienceLevels = { junior: 1, pleno: 2, senior: 3 };
    const userLevel = experienceLevels[userExperience as keyof typeof experienceLevels] || 2;
    const jobLevel = experienceLevels[jobExperience as keyof typeof experienceLevels] || 2;
    const experienceScore = Math.max(0, 100 - Math.abs(userLevel - jobLevel) * 25);

    // Location match (0-100)
    const locationScore = this.calculateLocationScore(userLocation, jobLocation);

    // Overall score (weighted average)
    const overallScore = Math.round(
      (skillsScore * 0.5) + (experienceScore * 0.3) + (locationScore * 0.2)
    );

    return {
      score: overallScore,
      breakdown: {
        skills: Math.round(skillsScore),
        experience: Math.round(experienceScore),
        location: Math.round(locationScore),
      },
    };
  }

  /**
   * Calculate location compatibility score
   */
  private static calculateLocationScore(userLocation: string, jobLocation: string): number {
    if (jobLocation.toLowerCase().includes('remote') || jobLocation.toLowerCase().includes('remoto')) {
      return 100; // Remote jobs are always compatible
    }
    
    if (userLocation.toLowerCase() === jobLocation.toLowerCase()) {
      return 100; // Same location
    }
    
    // Check if same city/region
    const userCity = userLocation.split(',')[0].trim().toLowerCase();
    const jobCity = jobLocation.split(',')[0].trim().toLowerCase();
    
    if (userCity === jobCity) {
      return 90;
    }
    
    // Check if same state/region
    const userState = userLocation.split(',')[1]?.trim().toLowerCase();
    const jobState = jobLocation.split(',')[1]?.trim().toLowerCase();
    
    if (userState && jobState && userState === jobState) {
      return 70;
    }
    
    return 30; // Different locations
  }

  /**
   * Safe array processing with validation
   */
  static normalizeOpportunities(opportunitiesData: unknown[]): Opportunity[] {
    return opportunitiesData
      .map(opportunity => this.normalizeOpportunity(opportunity))
      .filter((opportunity): opportunity is Opportunity => opportunity !== null);
  }

  static normalizeDatabaseOpportunities(opportunitiesData: unknown[]): Opportunity[] {
    return opportunitiesData
      .map(opportunity => this.normalizeDatabaseOpportunity(opportunity))
      .filter((opportunity): opportunity is Opportunity => opportunity !== null);
  }

  static normalizeApplications(applicationsData: unknown[]): Application[] {
    return applicationsData
      .map(application => this.normalizeApplication(application))
      .filter((application): application is Application => application !== null);
  }

  static normalizeFavorites(favoritesData: unknown[]): Favorite[] {
    return favoritesData
      .map(favorite => this.normalizeFavorite(favorite))
      .filter((favorite): favorite is Favorite => favorite !== null);
  }
}
