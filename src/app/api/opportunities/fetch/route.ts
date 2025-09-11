import { NextRequest, NextResponse } from 'next/server';
import { scrapeInfoJobs, getCachedInfoJobs, setCachedInfoJobs, InfoJobsJob } from '@/lib/scraping/infoJobsScraper';

// TheMuse API configuration
const THEMUSE_API_BASE = 'https://www.themuse.com/api/public/jobs';
const THEMUSE_API_KEY = process.env.THEMUSE_API_KEY || '';

// Adzuna API configuration
const ADZUNA_API_BASE = 'https://api.adzuna.com/v1/api/jobs';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';

interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: { min: number; max: number };
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
  userApplied: boolean;
  userFavorited: boolean;
  url: string;
  source?: string;
}

// Function to extract technologies from job description
function extractTechnologies(description: string): string[] {
  const techKeywords = [
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', 'Go',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'GraphQL', 'REST', 'API', 'Git', 'CI/CD', 'Terraform', 'Ansible', 'Jenkins', 'GitLab',
    'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel', 'Jest', 'Cypress', 'Selenium',
    'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'FastAPI', 'Next.js', 'Nuxt.js',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic', 'Cordova',
    'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Bitcoin', 'Smart Contracts'
  ];

  const foundTechs = techKeywords.filter(tech => 
    description.toLowerCase().includes(tech.toLowerCase())
  );

  return foundTechs.slice(0, 8); // Limit to 8 technologies
}

// Function to determine experience level from description
function determineExperienceLevel(description: string, title: string): string {
  const text = (description + ' ' + title).toLowerCase();
  
  if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('architect')) {
    return 'senior';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('intern')) {
    return 'junior';
  } else if (text.includes('mid') || text.includes('intermediate') || text.includes('pleno')) {
    return 'pleno';
  }
  
  return 'pleno'; // Default
}

// Function to calculate match score based on user skills
function calculateMatchScore(job: any, userSkills: string[]): number {
  const jobTechs = extractTechnologies(job.contents || job.description || '');
  const matchingSkills = jobTechs.filter(tech => 
    userSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()) || 
                            tech.toLowerCase().includes(skill.toLowerCase()))
  );
  
  const skillMatch = (matchingSkills.length / Math.max(jobTechs.length, 1)) * 100;
  const experienceMatch = 85; // Default experience match
  const locationMatch = 90; // Default location match (assuming remote-friendly)
  
  return Math.round((skillMatch * 0.6 + experienceMatch * 0.2 + locationMatch * 0.2));
}

// Function to fetch from TheMuse API
async function fetchFromTheMuse(page: number = 0, category: string = 'Software Engineer'): Promise<JobData[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      category: category,
      location: 'Brazil',
      level: 'Entry Level,Mid Level,Senior Level',
      desc: 'true'
    });

    const response = await fetch(`${THEMUSE_API_BASE}?${params}`, {
      headers: {
        'Accept': 'application/json',
        ...(THEMUSE_API_KEY && { 'Authorization': `Bearer ${THEMUSE_API_KEY}` })
      }
    });

    if (!response.ok) {
      throw new Error(`TheMuse API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results?.map((job: any) => {
      const technologies = extractTechnologies(job.contents || '');
      const experience = determineExperienceLevel(job.contents || '', job.name || '');
      
      return {
        id: `themuse-${job.id}`,
        title: job.name || 'Desenvolvedor',
        company: job.company?.name || 'Empresa',
        companyLogo: job.company?.logo_url,
        location: job.locations?.[0]?.name || 'Remoto',
        remote: job.locations?.[0]?.name?.toLowerCase().includes('remote') || false,
        salary: job.salary ? {
          min: job.salary.min || 0,
          max: job.salary.max || 0
        } : undefined,
        experience,
        contractType: 'CLT',
        technologies,
        description: job.contents?.substring(0, 200) + '...' || 'Descrição não disponível',
        postedAt: job.publication_date ? new Date(job.publication_date).toLocaleDateString('pt-BR') : 'Data não disponível',
        isNew: job.publication_date ? (Date.now() - new Date(job.publication_date).getTime()) < 7 * 24 * 60 * 60 * 1000 : false,
        isUrgent: false,
        matchScore: 75, // Will be calculated based on user skills
        matchBreakdown: {
          skills: 75,
          experience: 85,
          location: 90
        },
        userApplied: false,
        userFavorited: false,
        url: job.refs?.landing_page || '#'
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching from TheMuse:', error);
    return [];
  }
}

// Function to fetch from Adzuna API (backup)
async function fetchFromAdzuna(page: number = 1): Promise<JobData[]> {
  try {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      throw new Error('Adzuna API credentials not configured');
    }

    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: 'software developer',
      where: 'brazil',
      results_per_page: '20',
      page: page.toString(),
      content_type: 'application/json'
    });

    const response = await fetch(`${ADZUNA_API_BASE}/br/search/1?${params}`);
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results?.map((job: any) => {
      const technologies = extractTechnologies(job.description || '');
      const experience = determineExperienceLevel(job.description || '', job.title || '');
      
      return {
        id: `adzuna-${job.id}`,
        title: job.title || 'Desenvolvedor',
        company: job.company?.display_name || 'Empresa',
        companyLogo: job.company?.logo_url,
        location: job.location?.display_name || 'Remoto',
        remote: job.location?.display_name?.toLowerCase().includes('remote') || false,
        salary: job.salary_min && job.salary_max ? {
          min: job.salary_min,
          max: job.salary_max
        } : undefined,
        experience,
        contractType: 'CLT',
        technologies,
        description: job.description?.substring(0, 200) + '...' || 'Descrição não disponível',
        postedAt: job.created ? new Date(job.created).toLocaleDateString('pt-BR') : 'Data não disponível',
        isNew: job.created ? (Date.now() - new Date(job.created).getTime()) < 7 * 24 * 60 * 60 * 1000 : false,
        isUrgent: false,
        matchScore: 70,
        matchBreakdown: {
          skills: 70,
          experience: 80,
          location: 85
        },
        userApplied: false,
        userFavorited: false,
        url: job.redirect_url || '#'
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching from Adzuna:', error);
    return [];
  }
}

// Function to get mock data as fallback
function getMockData(): JobData[] {
  return [
    {
      id: 'mock-1',
      title: 'Senior React Developer',
      company: 'TechCorp Solutions',
      companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      location: 'São Paulo, SP',
      remote: true,
      salary: { min: 12000, max: 18000 },
      experience: 'senior',
      contractType: 'CLT',
      technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
      description: 'Estamos procurando um desenvolvedor sênior para liderar o desenvolvimento de nossa plataforma web.',
      postedAt: '2 dias atrás',
      isNew: true,
      isUrgent: false,
      matchScore: 95,
      matchBreakdown: {
        skills: 100,
        experience: 95,
        location: 100
      },
      userApplied: false,
      userFavorited: false,
      url: '#',
      source: 'mock'
    },
    {
      id: 'mock-2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
      location: 'Remoto',
      remote: true,
      salary: { min: 8000, max: 12000 },
      experience: 'pleno',
      contractType: 'PJ',
      technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
      description: 'Oportunidade para trabalhar em uma startup em crescimento com tecnologias modernas.',
      postedAt: '1 semana atrás',
      isNew: false,
      isUrgent: true,
      matchScore: 85,
      matchBreakdown: {
        skills: 80,
        experience: 90,
        location: 100
      },
      userApplied: false,
      userFavorited: true,
      url: '#',
      source: 'mock'
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const source = searchParams.get('source') || 'infojobs';
    const searchTerm = searchParams.get('search') || 'desenvolvedor';
    const userSkills = searchParams.get('skills')?.split(',') || [];

    let jobs: JobData[] = [];
    let dataSource = 'mock';

    // Check cache first for InfoJobs
    if (source === 'infojobs') {
      const cacheKey = `infojobs-${searchTerm}-${userSkills.join(',')}`;
      const cachedJobs = getCachedInfoJobs(cacheKey);
      
      if (cachedJobs && cachedJobs.length > 0) {
        console.log('Returning cached InfoJobs data');
        
        // Implementar paginação no cache
        const pageSize = 20;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedJobs = cachedJobs.slice(startIndex, endIndex);
        const hasMore = endIndex < cachedJobs.length;
        
        return NextResponse.json({
          success: true,
          data: paginatedJobs,
          pagination: {
            page,
            hasMore,
            total: cachedJobs.length,
            pageSize,
            totalPages: Math.ceil(cachedJobs.length / pageSize)
          },
          source: 'cache',
          cached: true
        });
      }
    }

    // Try InfoJobs scraping first (primary source)
    if (source === 'infojobs' || source === 'all') {
      try {
        console.log('Starting InfoJobs scraping...');
        const scrapedJobs = await scrapeInfoJobs(searchTerm);
        
        if (scrapedJobs.length > 0) {
          jobs = scrapedJobs;
          dataSource = 'infojobs';
          setCachedInfoJobs(`infojobs-${searchTerm}-${userSkills.join(',')}`, scrapedJobs);
          console.log(`InfoJobs scraping successful: ${scrapedJobs.length} jobs found`);
        }
      } catch (scrapingError) {
        console.error('InfoJobs scraping failed:', scrapingError);
      }
    }

    // Fallback to APIs if scraping fails
    if (jobs.length === 0) {
      if (source === 'themuse') {
        jobs = await fetchFromTheMuse(page);
        dataSource = 'themuse';
      } else if (source === 'adzuna') {
        jobs = await fetchFromAdzuna(page + 1);
        dataSource = 'adzuna';
      }
    }

    // Final fallback to mock data
    if (jobs.length === 0) {
      jobs = getMockData();
      dataSource = 'mock';
    }

    // Calculate match scores based on user skills
    if (userSkills.length > 0) {
      jobs = jobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, userSkills),
        matchBreakdown: {
          skills: calculateMatchScore(job, userSkills),
          experience: job.matchBreakdown.experience,
          location: job.matchBreakdown.location
        }
      }));
    }

    // Sort by match score
    jobs.sort((a, b) => b.matchScore - a.matchScore);

    // Implementar paginação
    const pageSize = 20;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    const hasMore = endIndex < jobs.length;

    return NextResponse.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page,
        hasMore,
        total: jobs.length,
        pageSize,
        totalPages: Math.ceil(jobs.length / pageSize)
      },
      source: dataSource,
      searchTerm,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in opportunities API:', error);
    
    // Return mock data as fallback
    const mockJobs = getMockData();
    
    // Implementar paginação no fallback também
    const pageSize = 20;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMockJobs = mockJobs.slice(startIndex, endIndex);
    const hasMore = endIndex < mockJobs.length;

    return NextResponse.json({
      success: false,
      data: paginatedMockJobs,
      pagination: {
        page,
        hasMore,
        total: mockJobs.length,
        pageSize,
        totalPages: Math.ceil(mockJobs.length / pageSize)
      },
      source: 'mock',
      error: 'Failed to fetch real data, showing mock data'
    });
  }
}
