import axios from 'axios';
import * as cheerio from 'cheerio';

export interface InfoJobsJob {
  id: string;
  title: string;
  company: string;
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
  source: string;
}

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User agents para evitar bloqueios
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Função para extrair tecnologias da descrição
export const extractTechnologies = (text: string): string[] => {
  const techKeywords = [
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', 'Go',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'GraphQL', 'REST', 'API', 'Git', 'CI/CD', 'Terraform', 'Ansible', 'Jenkins', 'GitLab',
    'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel', 'Jest', 'Cypress', 'Selenium',
    'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'FastAPI', 'Next.js', 'Nuxt.js',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic', 'Cordova',
    'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Bitcoin', 'Smart Contracts',
    'PHP', 'Ruby', 'Scala', 'Rust', 'C++', 'C', 'Assembly', 'MATLAB', 'R',
    'Vue.js', 'Svelte', 'Ember', 'Backbone', 'jQuery', 'Bootstrap', 'Tailwind',
    'Firebase', 'Supabase', 'PlanetScale', 'Prisma', 'Sequelize', 'TypeORM',
    'JWT', 'OAuth', 'Passport', 'Bcrypt', 'Crypto', 'SSL', 'TLS', 'HTTPS',
    'Android', 'iOS', 'Mobile', 'Full Stack', 'Frontend', 'Backend'
  ];

  const foundTechs = techKeywords.filter(tech => {
    const lowerText = text.toLowerCase();
    const lowerTech = tech.toLowerCase();
    
    // Para tecnologias de uma palavra, usar word boundary
    if (tech.split(' ').length === 1) {
      // Escapar caracteres especiais para regex
      const escapedTech = lowerTech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTech}\\b`, 'i');
      return regex.test(lowerText);
    }
    
    // Para tecnologias com múltiplas palavras, usar includes
    return lowerText.includes(lowerTech);
  });

  // Se não encontrou tecnologias específicas, adiciona tecnologias baseadas no título
  if (foundTechs.length === 0) {
    const lowerText = text.toLowerCase();
    
    // Mapeamento de palavras-chave para tecnologias
    if (lowerText.includes('fullstack') || lowerText.includes('full stack')) {
      foundTechs.push('Full Stack');
    }
    if (lowerText.includes('frontend') || lowerText.includes('front-end')) {
      foundTechs.push('Frontend');
    }
    if (lowerText.includes('backend') || lowerText.includes('back-end')) {
      foundTechs.push('Backend');
    }
    if (lowerText.includes('mobile')) {
      foundTechs.push('Mobile');
    }
    if (lowerText.includes('web')) {
      foundTechs.push('HTML', 'CSS');
    }
    if (lowerText.includes('desenvolvedor') || lowerText.includes('developer')) {
      foundTechs.push('JavaScript'); // Tecnologia padrão para desenvolvedor
    }
  }

  return [...new Set(foundTechs)].slice(0, 8); // Remove duplicatas e limita a 8
};

// Função para determinar nível de experiência
export const determineExperienceLevel = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal') || lowerText.includes('architect') || lowerText.includes('sênior') || lowerText.includes('sr')) {
    return 'senior';
  } else if (lowerText.includes('junior') || lowerText.includes('entry') || lowerText.includes('intern') || lowerText.includes('estagiário') || lowerText.includes('trainee') || lowerText.includes('jr')) {
    return 'junior';
  } else if (lowerText.includes('mid') || lowerText.includes('intermediate') || lowerText.includes('pleno') || lowerText.includes('médio') || lowerText.includes('pl')) {
    return 'pleno';
  }
  
  return 'pleno'; // Default
};

// Função para calcular match score
export const calculateMatchScore = (job: InfoJobsJob, userSkills: string[]): number => {
  const matchingSkills = job.technologies.filter(tech => 
    userSkills.some(skill => 
      skill.toLowerCase().includes(tech.toLowerCase()) || 
      tech.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const skillMatch = (matchingSkills.length / Math.max(job.technologies.length, 1)) * 100;
  const experienceMatch = 85; // Default
  const locationMatch = job.remote ? 100 : 80; // Remote jobs get higher location match
  
  return Math.round((skillMatch * 0.6 + experienceMatch * 0.2 + locationMatch * 0.2));
};

// Função para normalizar salário
export const normalizeSalary = (salaryText: string): { min: number; max: number } | undefined => {
  if (!salaryText) return undefined;
  
  // Remove caracteres não numéricos exceto pontos e vírgulas
  const cleanText = salaryText.replace(/[^\d.,]/g, '');
  
  // Procura por padrões como "1000-2000", "1.000,00 - 2.000,00", etc.
  const ranges = cleanText.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*[-–]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
  
  if (ranges) {
    const min = parseFloat(ranges[1].replace(/\./g, '').replace(',', '.'));
    const max = parseFloat(ranges[2].replace(/\./g, '').replace(',', '.'));
    
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }
  
  // Se não encontrar range, procura por valor único
  const singleValue = cleanText.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
  if (singleValue) {
    const value = parseFloat(singleValue[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(value)) {
      return { min: value * 0.8, max: value * 1.2 }; // Estimativa de range
    }
  }
  
  return undefined;
};

// Função para mapear termos de busca para URLs do InfoJobs
const mapSearchTermToInfoJobsUrl = (searchTerm: string): string => {
  const termMap: { [key: string]: string } = {
    'desenvolvedor': 'desenvolvedor',
    'programador': 'programador',
    'frontend': 'desenvolvedor+frontend',
    'backend': 'desenvolvedor+backend',
    'fullstack': 'desenvolvedor+fullstack',
    'react': 'react+desenvolvedor',
    'nodejs': 'nodejs+desenvolvedor',
    'python': 'python+desenvolvedor',
    'javascript': 'javascript+desenvolvedor',
    'typescript': 'typescript+desenvolvedor',
    'devops': 'devops',
    'mobile': 'desenvolvedor+mobile',
    'ui-ux': 'designer+ui+ux',
    'data-science': 'cientista+dados',
    'machine-learning': 'machine+learning',
    'java': 'java+desenvolvedor',
    'php': 'php+desenvolvedor',
    'c#': 'csharp+desenvolvedor',
    'go': 'go+desenvolvedor',
    'ruby': 'ruby+desenvolvedor',
    'angular': 'angular+desenvolvedor',
    'vue': 'vue+desenvolvedor',
    'laravel': 'laravel+desenvolvedor',
    'django': 'django+desenvolvedor',
    'spring': 'spring+desenvolvedor',
    'flutter': 'flutter+desenvolvedor',
    'react-native': 'react+native+desenvolvedor',
    'swift': 'swift+desenvolvedor',
    'kotlin': 'kotlin+desenvolvedor',
    'analista': 'analista+sistemas',
    'engenheiro': 'engenheiro+software',
    'arquiteto': 'arquiteto+software',
    'tech-lead': 'tech+lead',
    'gerente': 'gerente+projetos',
    'scrum': 'scrum+master',
    'product': 'product+manager',
    'qa': 'qa+testes',
    'tester': 'testador+software'
  };

  return termMap[searchTerm] || searchTerm;
};


// Função para fazer scraping de uma URL específica
const scrapeSingleUrl = async (url: string, searchTerm: string): Promise<InfoJobsJob[]> => {
  try {
    console.log(`📡 Fazendo requisição para: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000
    });

    if (response.status !== 200) {
      throw new Error(`InfoJobs API error: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const jobs: InfoJobsJob[] = [];

    // Usa o seletor original que funcionava
    $('.pt-24.px-24.cursor-pointer.js_vacancyLoad.js_cardLink').each((index, element) => {
      try {
        const $el = $(element);
        
        // Extrai dados básicos
        const title = $el.find('a[href*="vaga"]').first().text().trim();
        const link = $el.find('a[href*="vaga"]').first().attr('href');
        
        if (!title || !link) return;

        // Procura por empresa e localização
        let empresa = 'Empresa não informada';
        let local = 'Localização não informada';
        
        // Procura por empresa em diferentes elementos
        const empresaElement = $el.find('.company, .empresa, .employer, .tag-company, [class*="company"]').first();
        if (empresaElement.length > 0) {
          empresa = empresaElement.text().trim();
        } else {
        // Procura em spans e divs que não sejam o título
        const empresaAlt = $el.find('span, div').filter((i, el) => {
          const text = $(el).text().trim();
          return Boolean(text && !text.includes('desenvolvedor') && !text.includes('vaga') && text.length < 50 && text !== title);
        }).first().text().trim();
          if (empresaAlt) empresa = empresaAlt;
        }
        
        // Procura por localização
        const localElement = $el.find('.location, .local, .city, .tag-location, [class*="location"]').first();
        if (localElement.length > 0) {
          local = localElement.text().trim();
        } else {
        // Procura por padrões de localização
        const localAlt = $el.find('span, div').filter((i, el) => {
          const text = $(el).text().trim();
          return Boolean(text && (text.includes('/') || text.includes('SP') || text.includes('RJ') || text.includes('MG') || text.includes('km')));
        }).first().text().trim();
          if (localAlt) local = localAlt;
        }
        
        // Determina se é remoto
        const remote = local.toLowerCase().includes('remoto') || local.toLowerCase().includes('home office') || local.toLowerCase().includes('remote');
        
        // Extrai tecnologias do título e empresa
        const technologies = extractTechnologies(title + ' ' + empresa + ' ' + local);
        
        // Determina nível de experiência
        const experience = determineExperienceLevel(title);
        
        // Data de publicação (tenta extrair do HTML)
        const dateValue = $el.find('.js_date').attr('data-value');
        const postedAt = dateValue ? 
          new Date(dateValue).toLocaleDateString('pt-BR') : 
          'Data não informada';
        
        const job: InfoJobsJob = {
          id: `infojobs-${index}-${Date.now()}`,
          title,
          company: empresa,
          location: local,
          remote,
          salary: undefined, // InfoJobs não mostra salário na listagem
          experience,
          contractType: 'CLT', // Default
          technologies,
          description: `Vaga de ${title} na empresa ${empresa} localizada em ${local}.`,
          postedAt,
          isNew: postedAt.includes('hoje') || postedAt.includes('ontem'),
          isUrgent: false,
          matchScore: 75,
          matchBreakdown: {
            skills: 75,
            experience: 85,
            location: remote ? 100 : 80
          },
          userApplied: false,
          userFavorited: false,
          url: link.startsWith('http') ? link : `https://www.infojobs.com.br${link}`,
          source: 'infojobs.com.br'
        };

        jobs.push(job);
      } catch (error) {
        console.error('Error parsing InfoJobs job:', error);
      }
    });

    console.log(`✅ InfoJobs scraping concluído: ${jobs.length} vagas encontradas para ${searchTerm}`);
    return jobs;

  } catch (error) {
    console.error(`Error scraping InfoJobs para ${searchTerm}:`, error);
    return [];
  }
};

// Scraper principal para InfoJobs com múltiplas buscas
export const scrapeInfoJobs = async (searchTerm: string = 'desenvolvedor'): Promise<InfoJobsJob[]> => {
  try {
    console.log(`🔍 Scraping InfoJobs para: ${searchTerm}`);
    
    // Lista de termos de busca para maximizar resultados
    const searchTerms = [
      searchTerm,
      'desenvolvedor',
      'programador',
      'frontend',
      'backend',
      'fullstack',
      'react',
      'javascript'
    ];

    // Remove duplicatas e limita a 4 termos para não sobrecarregar
    const uniqueTerms = [...new Set(searchTerms)].slice(0, 4);
    
    console.log(`🎯 Fazendo ${uniqueTerms.length} buscas diferentes...`);
    
    const allJobs: InfoJobsJob[] = [];
    const jobUrls = new Set<string>(); // Para evitar duplicatas
    
    // Faz múltiplas buscas sequenciais (mais seguro)
    for (let i = 0; i < uniqueTerms.length; i++) {
      const term = uniqueTerms[i];
      
      // Adiciona delay entre requisições para evitar bloqueio
      if (i > 0) {
        await delay(2000); // 2 segundos entre requisições
      }
      
      const mappedTerm = mapSearchTermToInfoJobsUrl(term);
      const url = `https://www.infojobs.com.br/empregos.aspx?palabra=${encodeURIComponent(mappedTerm)}&provincia=brasil`;
      
      try {
        const jobs = await scrapeSingleUrl(url, term);
        
        jobs.forEach(job => {
          // Evita duplicatas baseado na URL
          if (!jobUrls.has(job.url)) {
            jobUrls.add(job.url);
            allJobs.push(job);
          }
        });
        
        console.log(`✅ Busca "${term}": ${jobs.length} vagas encontradas, ${allJobs.length} total únicas`);
      } catch (error) {
        console.error(`❌ Erro na busca "${term}":`, error);
      }
    }
    
    console.log(`🎉 Total de vagas únicas encontradas: ${allJobs.length}`);
    return allJobs.slice(0, 80); // Retorna até 80 vagas únicas

  } catch (error) {
    console.error('Error scraping InfoJobs:', error);
    return [];
  }
};

// Cache simples em memória
const cache = new Map<string, { data: InfoJobsJob[], timestamp: number }>();
const CACHE_DURATION = 0; // Cache desabilitado para debug

export const getCachedInfoJobs = (key: string): InfoJobsJob[] | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedInfoJobs = (key: string, data: InfoJobsJob[]): void => {
  cache.set(key, { data, timestamp: Date.now() });
};
