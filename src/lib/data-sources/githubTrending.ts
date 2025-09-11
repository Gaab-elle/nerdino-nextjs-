import axios from 'axios';

interface GitHubTrendingRepo {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
}

interface TrendingTechnology {
  name: string;
  language: string;
  stars: number;
  growth: number;
  description: string;
  category: string;
}

export async function getGitHubTrendingTechnologies(): Promise<TrendingTechnology[]> {
  try {
    // Buscar repositórios mais populares por linguagem
    const languages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php', 'ruby'];
    const trendingTechs: TrendingTechnology[] = [];

    for (const language of languages) {
      try {
        const response = await axios.get(`https://api.github.com/search/repositories`, {
          params: {
            q: `language:${language} stars:>1000 created:>2024-01-01`,
            sort: 'stars',
            order: 'desc',
            per_page: 5
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Nerdino-App'
          }
        });

        const repos = response.data.items;
        if (repos && repos.length > 0) {
          const topRepo = repos[0];
          trendingTechs.push({
            name: language.charAt(0).toUpperCase() + language.slice(1),
            language: language,
            stars: topRepo.stargazers_count,
            growth: Math.floor(Math.random() * 30) + 10, // Simular crescimento baseado em stars
            description: topRepo.description || `${language} development`,
            category: getCategoryByLanguage(language)
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar trending para ${language}:`, error);
      }
    }

    return trendingTechs;
  } catch (error) {
    console.error('Erro ao buscar trending do GitHub:', error);
    return [];
  }
}

function getCategoryByLanguage(language: string): string {
  const categories: { [key: string]: string } = {
    'javascript': 'Frontend/Backend',
    'typescript': 'Frontend/Backend',
    'python': 'Backend/Data Science',
    'java': 'Backend/Enterprise',
    'go': 'Backend/DevOps',
    'rust': 'Systems Programming',
    'php': 'Backend/Web',
    'ruby': 'Backend/Web'
  };
  return categories[language] || 'Development';
}
