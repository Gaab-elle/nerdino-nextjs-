import {
  ProjectDTO,
  GitHubStatsDTO,
  ShareProjectDataDTO,
  Project,
  GitHubStats,
  ShareProjectData,
  validateProject,
  validateGitHubStats,
  validateShareProjectData,
} from '@/schemas/projects';
import { ProjectWithRelations } from '@/types/prisma';

export class ProjectAdapter {
  /**
   * Normalize project data from API response to internal model
   */
  static normalizeProject(projectData: unknown): Project {
    const dto = validateProject(projectData);
    
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? '',
      status: dto.status ?? 'active',
      progress: dto.progress ?? 0,
      technologies: dto.technologies ?? [],
      githubUrl: dto.githubUrl,
      liveUrl: dto.liveUrl,
      lastActivity: dto.lastActivity ?? new Date().toISOString(),
      createdAt: dto.createdAt ?? new Date().toISOString(),
      updatedAt: dto.updatedAt ?? new Date().toISOString(),
      userId: dto.userId ?? '',
      isPublic: dto.isPublic ?? true,
      imageUrl: dto.imageUrl,
      tags: dto.tags ?? [],
    };
  }

  /**
   * Normalize database project data to internal model
   */
  static normalizeDatabaseProject(raw: any): Project {
    return {
      id: raw.id,
      name: raw.title ?? raw.name ?? 'Sem nome',
      description: raw.description ?? '',
      status: (raw.status as Project['status']) ?? 'active',
      progress: raw.progress ?? 0,
      technologies: raw.technologies ?? [],
      githubUrl: raw.github_url ?? undefined,
      liveUrl: raw.live_url ?? undefined,
      lastActivity: raw.updated_at?.toISOString() ?? new Date().toISOString(),
      createdAt: raw.created_at?.toISOString() ?? new Date().toISOString(),
      updatedAt: raw.updated_at?.toISOString() ?? new Date().toISOString(),
      userId: raw.user_id ?? '',
      isPublic: raw.is_public ?? true,
      imageUrl: raw.image_url ?? undefined,
      tags: raw.tags?.map((t: any) => t.tag?.name ?? t.name ?? '') ?? [],
    };
  }

  /**
   * Normalize GitHub stats data
   */
  static normalizeGitHubStats(statsData: unknown): GitHubStats {
    const dto = validateGitHubStats(statsData);
    
    return {
      stats: {
        languages: dto.stats?.languages ?? {},
        totalRepos: dto.stats?.totalRepos ?? 0,
        totalStars: dto.stats?.totalStars ?? 0,
        totalForks: dto.stats?.totalForks ?? 0,
        totalCommits: dto.stats?.totalCommits ?? 0,
      },
      repos: (dto.repos ?? []).map(repo => ({
        name: repo.name,
        description: repo.description ?? '',
        language: repo.language ?? '',
        stargazers_count: repo.stargazers_count ?? 0,
        forks_count: repo.forks_count ?? 0,
        html_url: repo.html_url ?? '',
        updated_at: repo.updated_at ?? '',
      })),
    };
  }

  /**
   * Normalize share project data
   */
  static normalizeShareProjectData(shareData: unknown): ShareProjectData {
    const dto = validateShareProjectData(shareData);
    
    return {
      includeTechnologies: dto.includeTechnologies ?? true,
      includeStatus: dto.includeStatus ?? true,
      includeProgress: dto.includeProgress ?? true,
      includeLinks: dto.includeLinks ?? true,
      customMessage: dto.customMessage ?? '',
    };
  }

  /**
   * Generate project share content
   */
  static generateShareContent(project: Project, shareData: ShareProjectData): string {
    let content = `🚀 ${project.name}`;
    
    if (project.description) {
      content += `\n\n${project.description}`;
    }
    
    if (shareData.includeStatus) {
      content += `\n\n📊 Status: ${this.getStatusLabel(project.status)}`;
    }
    
    if (shareData.includeProgress) {
      content += `\n📈 Progresso: ${project.progress}%`;
    }
    
    if (shareData.includeTechnologies && project.technologies.length > 0) {
      content += `\n🛠️ Tecnologias: ${project.technologies.join(', ')}`;
    }
    
    if (shareData.includeLinks) {
      if (project.githubUrl) {
        content += `\n🔗 GitHub: ${project.githubUrl}`;
      }
      if (project.liveUrl) {
        content += `\n🌐 Demo: ${project.liveUrl}`;
      }
    }
    
    if (shareData.customMessage) {
      content += `\n\n💬 ${shareData.customMessage}`;
    }
    
    return content;
  }

  /**
   * Get status label in Portuguese
   */
  private static getStatusLabel(status: Project['status']): string {
    const statusLabels = {
      active: 'Ativo',
      completed: 'Concluído',
      paused: 'Pausado',
      archived: 'Arquivado',
    };
    return statusLabels[status];
  }

  /**
   * Generate project metadata for sharing
   */
  static generateProjectMetadata(project: Project): Record<string, unknown> {
    return {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      technologies: project.technologies,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      lastActivity: project.lastActivity,
    };
  }

  /**
   * Safe array processing with validation
   */
  static normalizeProjects(projectsData: unknown[]): Project[] {
    return projectsData
      .map(project => {
        try {
          return this.normalizeProject(project);
        } catch (error) {
          console.warn('Skipping invalid project data:', error);
          return null;
        }
      })
      .filter((project): project is Project => project !== null);
  }

  /**
   * Calculate project completion percentage
   */
  static calculateProgress(project: Project): number {
    // Simple progress calculation based on status
    const statusProgress = {
      active: 25,
      paused: 50,
      completed: 100,
      archived: 0,
    };
    
    return Math.max(project.progress, statusProgress[project.status]);
  }

  /**
   * Get project display name with status
   */
  static getProjectDisplayName(project: Project): string {
    const statusLabel = this.getStatusLabel(project.status);
    return `${project.name} - ${statusLabel} (${project.progress}%)`;
  }

  /**
   * Check if project is recently updated
   */
  static isRecentlyUpdated(project: Project, daysThreshold: number = 7): boolean {
    const lastUpdate = new Date(project.lastActivity);
    const now = new Date();
    const diffTime = now.getTime() - lastUpdate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
  }

  /**
   * Get project technologies as display string
   */
  static getTechnologiesDisplay(project: Project, maxCount: number = 5): string {
    if (project.technologies.length === 0) {
      return 'Nenhuma tecnologia especificada';
    }
    
    const displayTechs = project.technologies.slice(0, maxCount);
    const remaining = project.technologies.length - maxCount;
    
    let result = displayTechs.join(', ');
    if (remaining > 0) {
      result += ` e mais ${remaining}`;
    }
    
    return result;
  }
}
