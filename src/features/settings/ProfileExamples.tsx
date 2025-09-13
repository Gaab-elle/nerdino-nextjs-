'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, Code, Briefcase, GraduationCap, Award, Link } from 'lucide-react';

export default function ProfileExamples() {
  const examples = {
    bio: {
      title: "Bio Profissional",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      examples: [
        "Desenvolvedor Full Stack apaixonado por React e Node.js. 3+ anos criando soluções web inovadoras.",
        "Engenheiro de Software especializado em Python e Machine Learning. Experiência em startups e grandes corporações.",
        "Frontend Developer com foco em UX/UI. Transformo ideias em interfaces incríveis usando React e TypeScript.",
        "DevOps Engineer com expertise em AWS e Kubernetes. Automatizo processos para maximizar eficiência."
      ]
    },
    experience: {
      title: "Experiência Profissional",
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      examples: [
        {
          title: "Desenvolvedor Frontend - TechCorp (2021-2024)",
          description: "Criação de interfaces responsivas usando React e TypeScript. Colaboração em equipe ágil com 8 desenvolvedores.",
          technologies: ["React", "TypeScript", "Tailwind CSS", "Jest"]
        },
        {
          title: "Full Stack Developer - StartupXYZ (2019-2021)",
          description: "Desenvolvimento de aplicações web completas. Implementação de APIs REST e integração com bancos de dados.",
          technologies: ["Node.js", "Express", "MongoDB", "React"]
        }
      ]
    },
    skills: {
      title: "Habilidades Técnicas",
      icon: <Code className="h-5 w-5 text-purple-600" />,
      categories: {
        "Linguagens": ["JavaScript", "TypeScript", "Python", "Java", "C++"],
        "Frontend": ["React", "Vue.js", "Angular", "Next.js", "Tailwind CSS"],
        "Backend": ["Node.js", "Express", "Django", "Spring Boot", "FastAPI"],
        "Banco de Dados": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
        "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "Git", "CI/CD"],
        "Ferramentas": ["VS Code", "Figma", "Postman", "Jira", "Slack"]
      }
    },
    education: {
      title: "Formação Acadêmica",
      icon: <GraduationCap className="h-5 w-5 text-orange-600" />,
      examples: [
        {
          degree: "Bacharelado em Ciência da Computação",
          institution: "Universidade Federal de São Paulo",
          period: "2018-2022",
          description: "Foco em algoritmos, estruturas de dados e desenvolvimento de software."
        },
        {
          degree: "Técnico em Informática",
          institution: "ETEC São Paulo",
          period: "2016-2018",
          description: "Fundamentos de programação e desenvolvimento web."
        }
      ]
    },
    certifications: {
      title: "Certificações",
      icon: <Award className="h-5 w-5 text-red-600" />,
      examples: [
        {
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          date: "2023",
          description: "Desenvolvimento de aplicações na nuvem AWS"
        },
        {
          name: "Google Cloud Professional",
          issuer: "Google Cloud",
          date: "2022",
          description: "Arquitetura e desenvolvimento em GCP"
        },
        {
          name: "Certified Kubernetes Administrator",
          issuer: "Cloud Native Computing Foundation",
          date: "2023",
          description: "Administração e orquestração de containers"
        }
      ]
    },
    projects: {
      title: "Projetos",
      icon: <Link className="h-5 w-5 text-indigo-600" />,
      examples: [
        {
          name: "E-commerce Platform",
          description: "Plataforma completa de e-commerce com React, Node.js e PostgreSQL",
          technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"],
          link: "https://github.com/usuario/ecommerce-platform",
          features: ["Autenticação", "Pagamentos", "Admin Panel", "API REST"]
        },
        {
          name: "Task Management App",
          description: "Aplicação de gerenciamento de tarefas com drag-and-drop",
          technologies: ["Vue.js", "Express", "MongoDB", "Socket.io"],
          link: "https://github.com/usuario/task-manager",
          features: ["Real-time", "Drag & Drop", "Colaboração", "Notificações"]
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Exemplos e Orientações
        </h2>
        <p className="text-gray-600">Use estes exemplos como referência para criar seu perfil</p>
      </div>

      {/* Bio Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.bio.icon}
            {examples.bio.title}
          </CardTitle>
          <CardDescription>
            Dicas para escrever uma bio profissional atrativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examples.bio.examples.map((example, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">{example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.experience.icon}
            {examples.experience.title}
          </CardTitle>
          <CardDescription>
            Como estruturar suas experiências profissionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.experience.examples.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">{exp.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{exp.description}</p>
                <div className="flex flex-wrap gap-1">
                  {exp.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.skills.icon}
            {examples.skills.title}
          </CardTitle>
          <CardDescription>
            Organize suas habilidades por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(examples.skills.categories).map(([category, skills]) => (
              <div key={category} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.education.icon}
            {examples.education.title}
          </CardTitle>
          <CardDescription>
            Formato para formação acadêmica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examples.education.examples.map((edu, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-700">{edu.degree}</h4>
                <p className="text-sm text-gray-600">{edu.institution} • {edu.period}</p>
                <p className="text-xs text-gray-500 mt-1">{edu.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.certifications.icon}
            {examples.certifications.title}
          </CardTitle>
          <CardDescription>
            Como listar suas certificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examples.certifications.examples.map((cert, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-red-700">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.issuer} • {cert.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{cert.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {cert.date}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {examples.projects.icon}
            {examples.projects.title}
          </CardTitle>
          <CardDescription>
            Como descrever seus projetos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.projects.examples.map((project, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-indigo-700">{project.name}</h4>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Link className="h-3 w-3 mr-1" />
                    Ver Projeto
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Tecnologias:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Funcionalidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
