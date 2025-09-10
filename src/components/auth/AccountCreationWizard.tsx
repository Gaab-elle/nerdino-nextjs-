'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Eye, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface AccountCreationWizardProps {
  onComplete?: (profileData: any) => void;
}

export default function AccountCreationWizard({ onComplete }: AccountCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'resume' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    skills: [] as string[],
    experience: '',
    education: '',
    certifications: '',
    contact: '',
  });

  const steps = [
    { id: 1, title: 'Cadastro Básico', description: 'Informações essenciais' },
    { id: 2, title: 'Configuração do Perfil', description: 'Como criar seu perfil' },
    { id: 3, title: 'Finalização', description: 'Preview e publicação' },
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const popularSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'Vue.js',
    'Angular', 'Next.js', 'Nuxt.js', 'Express', 'Django', 'Flask',
    'Laravel', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP'
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Criar Conta no NERDINO</h2>
        <p className="text-gray-600">Vamos começar com suas informações básicas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Ex: joao@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Ex: joao_dev"
            required
          />
          <p className="text-xs text-gray-500">Este será seu nome de usuário único</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setCurrentStep(2)}
          disabled={!formData.name || !formData.email || !formData.username}
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Como criar seu perfil?</h2>
        <p className="text-gray-600">Escolha a melhor opção para você</p>
      </div>

      {!creationMethod ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCreationMethod('manual')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Configuração Manual
              </CardTitle>
              <CardDescription>
                Preencha seus dados manualmente com exemplos práticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Formulário guiado
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Exemplos práticos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Controle total
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCreationMethod('resume')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Importar Currículo
              </CardTitle>
              <CardDescription>
                Upload do PDF e extração automática com IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Extração automática
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Revisão e edição
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Rápido e fácil
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {creationMethod === 'manual' ? renderManualForm() : renderResumeUpload()}
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        {creationMethod && (
          <Button 
            onClick={() => setCurrentStep(3)}
            disabled={!formData.bio && !formData.skills.length}
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Preencha seu perfil</h3>
        <p className="text-gray-600">Use os exemplos como referência</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Bio *</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Ex: Desenvolvedor Full Stack apaixonado por React e Node.js. 3+ anos criando soluções web inovadoras."
            rows={3}
          />
          <p className="text-xs text-gray-500">Descreva-se profissionalmente</p>
        </div>

        <div className="space-y-2">
          <Label>Habilidades Técnicas *</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => handleSkillRemove(skill)}>
                {skill} ×
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {popularSkills.slice(0, 12).map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => handleSkillAdd(skill)}
                disabled={formData.skills.includes(skill)}
                className="text-xs"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experiência Profissional</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            placeholder="Ex: Desenvolvedor Frontend - TechCorp (2021-2024): Criação de interfaces responsivas usando React e TypeScript..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Formação Acadêmica</Label>
          <Textarea
            id="education"
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            placeholder="Ex: Bacharelado em Ciência da Computação - Universidade XYZ (2018-2022)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications">Certificações</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', e.target.value)}
            placeholder="Ex: AWS Certified Developer, Google Cloud Professional"
            rows={2}
          />
        </div>
      </div>
    </div>
  );

  const renderResumeUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Importar Currículo</h3>
        <p className="text-gray-600">Faça upload do seu PDF e extrairemos as informações automaticamente</p>
      </div>

      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold mb-2">Arraste seu PDF aqui</h4>
          <p className="text-gray-500 mb-4">ou clique para selecionar</p>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Selecionar Arquivo
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Formatos aceitos: PDF, DOC, DOCX (máx. 10MB)
          </p>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">O que será extraído:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Nome e informações de contato</li>
          <li>• Experiência profissional</li>
          <li>• Formação acadêmica</li>
          <li>• Habilidades e tecnologias</li>
          <li>• Certificações</li>
        </ul>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Preview do seu perfil</h2>
        <p className="text-gray-600">Revise as informações antes de publicar</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{formData.name}</h3>
              <p className="text-gray-600">@{formData.username}</p>
              <p className="text-sm text-gray-500">{formData.bio}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {formData.experience && (
              <div>
                <h4 className="font-semibold mb-2">Experiência</h4>
                <p className="text-sm text-gray-600">{formData.experience}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          onClick={() => onComplete?.(formData)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Criar Perfil
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="mb-4" />
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {step.id}
              </div>
              <p className="font-medium">{step.title}</p>
              <p className="text-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
}
