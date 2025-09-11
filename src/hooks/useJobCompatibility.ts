'use client';

import { useMemo } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  technologies: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
  };
  remote: boolean;
  url: string;
  date: string;
  matchScore?: number;
  matchBreakdown?: {
    skills: number;
    experience: number;
    location: number;
  };
}

interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

export const useJobCompatibility = (jobs: Job[], userProfile: UserProfile) => {
  const jobsWithCompatibility = useMemo(() => {
    return jobs.map(job => {
      const compatibility = calculateCompatibility(userProfile, job);
      return {
        ...job,
        matchScore: compatibility.overall,
        matchBreakdown: compatibility.breakdown
      };
    });
  }, [jobs, userProfile]);

  return jobsWithCompatibility;
};

// Função para calcular compatibilidade real
const calculateCompatibility = (userProfile: UserProfile, job: Job) => {
  const breakdown = {
    skills: 0,
    experience: 0,
    location: 0
  };

  // 1. Cálculo de compatibilidade de skills (peso: 60%)
  breakdown.skills = calculateSkillsCompatibility(userProfile.skills, job.technologies, job.title);

  // 2. Cálculo de compatibilidade de experiência (peso: 25%)
  breakdown.experience = calculateExperienceCompatibility(userProfile.experience, job.experience);

  // 3. Cálculo de compatibilidade de localização (peso: 15%)
  breakdown.location = calculateLocationCompatibility(userProfile.location, job.location, job.remote);

  // Cálculo final ponderado
  const overall = Math.round(
    (breakdown.skills * 0.6) + 
    (breakdown.experience * 0.25) + 
    (breakdown.location * 0.15)
  );

  return {
    overall: Math.min(overall, 100),
    breakdown
  };
};

// Função para calcular compatibilidade de skills
const calculateSkillsCompatibility = (userSkills: string[], jobTechnologies: string[], jobTitle: string = ''): number => {
  if (userSkills.length === 0) {
    return 0;
  }

  const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
  const normalizedUserSkills = userSkills.map(normalizeSkill);
  const normalizedJobTechs = jobTechnologies.map(normalizeSkill);
  const normalizedJobTitle = jobTitle.toLowerCase();

  // Se não há tecnologias definidas, tenta inferir do título
  if (jobTechnologies.length === 0) {
    const titleToTechMap: { [key: string]: string[] } = {
      'javascript': ['javascript', 'js'],
      'react': ['react'],
      'node': ['node.js', 'nodejs'],
      'python': ['python'],
      'java': ['java'],
      'fullstack': ['full stack', 'fullstack'],
      'frontend': ['frontend', 'front-end'],
      'backend': ['backend', 'back-end'],
      'mobile': ['mobile', 'android', 'ios'],
      'devops': ['devops', 'dev ops'],
      'typescript': ['typescript', 'ts'],
      'vue': ['vue.js', 'vue'],
      'angular': ['angular'],
      'php': ['php'],
      'c#': ['c#', 'csharp'],
      'ruby': ['ruby'],
      'go': ['go', 'golang'],
      'rust': ['rust'],
      'swift': ['swift'],
      'kotlin': ['kotlin'],
      'flutter': ['flutter'],
      'react native': ['react native'],
      'docker': ['docker'],
      'kubernetes': ['kubernetes', 'k8s'],
      'aws': ['aws', 'amazon web services'],
      'azure': ['azure'],
      'gcp': ['gcp', 'google cloud'],
      'sql': ['sql', 'mysql', 'postgresql'],
      'mongodb': ['mongodb', 'mongo'],
      'redis': ['redis'],
      'elasticsearch': ['elasticsearch'],
      'graphql': ['graphql'],
      'rest': ['rest', 'restful'],
      'microservices': ['microservices'],
      'api': ['api', 'apis'],
      'git': ['git', 'github', 'gitlab'],
      'jenkins': ['jenkins'],
      'terraform': ['terraform'],
      'ansible': ['ansible'],
      'linux': ['linux', 'ubuntu', 'centos'],
      'bash': ['bash', 'shell'],
      'powershell': ['powershell'],
      'agile': ['agile', 'scrum', 'kanban'],
      'jira': ['jira'],
      'confluence': ['confluence'],
      'figma': ['figma'],
      'sketch': ['sketch'],
      'adobe': ['adobe', 'photoshop', 'illustrator'],
      'unity': ['unity'],
      'unreal': ['unreal engine'],
      'blender': ['blender'],
      'maya': ['maya'],
      '3ds max': ['3ds max'],
      'autocad': ['autocad'],
      'solidworks': ['solidworks'],
      'machine learning': ['machine learning', 'ml', 'ai'],
      'artificial intelligence': ['artificial intelligence', 'ai'],
      'data science': ['data science'],
      'big data': ['big data'],
      'blockchain': ['blockchain'],
      'cryptocurrency': ['cryptocurrency', 'crypto'],
      'iot': ['iot', 'internet of things'],
      'ar': ['ar', 'augmented reality'],
      'vr': ['vr', 'virtual reality'],
      'robotics': ['robotics'],
      'automation': ['automation'],
      'testing': ['testing', 'qa', 'quality assurance'],
      'selenium': ['selenium'],
      'cypress': ['cypress'],
      'jest': ['jest'],
      'mocha': ['mocha'],
      'chai': ['chai'],
      'enzyme': ['enzyme'],
      'storybook': ['storybook'],
      'webpack': ['webpack'],
      'babel': ['babel'],
      'eslint': ['eslint'],
      'prettier': ['prettier'],
      'sass': ['sass', 'scss'],
      'less': ['less'],
      'stylus': ['stylus'],
      'tailwind': ['tailwind', 'tailwindcss'],
      'bootstrap': ['bootstrap'],
      'material ui': ['material ui', 'mui'],
      'ant design': ['ant design'],
      'chakra ui': ['chakra ui'],
      'styled components': ['styled components'],
      'emotion': ['emotion'],
      'jss': ['jss'],
      'css modules': ['css modules'],
      'postcss': ['postcss'],
      'autoprefixer': ['autoprefixer'],
      'gulp': ['gulp'],
      'grunt': ['grunt'],
      'npm': ['npm'],
      'yarn': ['yarn'],
      'pnpm': ['pnpm'],
      'lerna': ['lerna'],
      'nx': ['nx'],
      'rush': ['rush'],
      'monorepo': ['monorepo'],
      'microfrontend': ['microfrontend'],
      'pwa': ['pwa', 'progressive web app'],
      'spa': ['spa', 'single page application'],
      'ssr': ['ssr', 'server side rendering'],
      'csr': ['csr', 'client side rendering'],
      'isr': ['isr', 'incremental static regeneration'],
      'ssg': ['ssg', 'static site generation'],
      'jamstack': ['jamstack'],
      'headless cms': ['headless cms'],
      'contentful': ['contentful'],
      'strapi': ['strapi'],
      'sanity': ['sanity'],
      'ghost': ['ghost'],
      'wordpress': ['wordpress'],
      'drupal': ['drupal'],
      'joomla': ['joomla'],
      'magento': ['magento'],
      'shopify': ['shopify'],
      'woocommerce': ['woocommerce'],
      'prestashop': ['prestashop'],
      'opencart': ['opencart'],
      'bigcommerce': ['bigcommerce'],
      'squarespace': ['squarespace'],
      'wix': ['wix'],
      'webflow': ['webflow'],
      'framer': ['framer'],
      'principle': ['principle'],
      'invision': ['invision'],
      'marvel': ['marvel'],
      'proto': ['proto'],
      'zeplin': ['zeplin'],
      'avocode': ['avocode'],
      'handoff': ['handoff'],
      'abstract': ['abstract'],
      'sketch': ['sketch'],
      'figma': ['figma'],
      'adobe xd': ['adobe xd'],
      'balsamiq': ['balsamiq'],
      'wireframe': ['wireframe'],
      'mockup': ['mockup'],
      'prototype': ['prototype'],
      'user research': ['user research'],
      'usability testing': ['usability testing'],
      'a/b testing': ['a/b testing'],
      'analytics': ['analytics', 'google analytics'],
      'gtm': ['gtm', 'google tag manager'],
      'hotjar': ['hotjar'],
      'mixpanel': ['mixpanel'],
      'amplitude': ['amplitude'],
      'segment': ['segment'],
      'intercom': ['intercom'],
      'zendesk': ['zendesk'],
      'freshdesk': ['freshdesk'],
      'help scout': ['help scout'],
      'drift': ['drift'],
      'crisp': ['crisp'],
      'tawk': ['tawk'],
      'livechat': ['livechat'],
      'olark': ['olark'],
      'zopim': ['zopim'],
      'pure chat': ['pure chat'],
      'tidio': ['tidio'],
      'chatbot': ['chatbot'],
      'nlp': ['nlp', 'natural language processing'],
      'computer vision': ['computer vision'],
      'deep learning': ['deep learning'],
      'neural network': ['neural network'],
      'tensorflow': ['tensorflow'],
      'pytorch': ['pytorch'],
      'keras': ['keras'],
      'scikit learn': ['scikit learn', 'sklearn'],
      'pandas': ['pandas'],
      'numpy': ['numpy'],
      'matplotlib': ['matplotlib'],
      'seaborn': ['seaborn'],
      'plotly': ['plotly'],
      'd3': ['d3.js', 'd3'],
      'chart.js': ['chart.js'],
      'highcharts': ['highcharts'],
      'echarts': ['echarts'],
      'observable': ['observable'],
      'jupyter': ['jupyter'],
      'colab': ['colab', 'google colab'],
      'kaggle': ['kaggle'],
      'databricks': ['databricks'],
      'snowflake': ['snowflake'],
      'redshift': ['redshift'],
      'bigquery': ['bigquery'],
      'hadoop': ['hadoop'],
      'spark': ['spark', 'apache spark'],
      'kafka': ['kafka', 'apache kafka'],
      'storm': ['storm', 'apache storm'],
      'flink': ['flink', 'apache flink'],
      'beam': ['beam', 'apache beam'],
      'airflow': ['airflow', 'apache airflow'],
      'luigi': ['luigi'],
      'prefect': ['prefect'],
      'dagster': ['dagster'],
      'mlflow': ['mlflow'],
      'kubeflow': ['kubeflow'],
      'sagemaker': ['sagemaker'],
      'vertex ai': ['vertex ai'],
      'azure ml': ['azure ml'],
      'databricks ml': ['databricks ml'],
      'h2o': ['h2o'],
      'rapids': ['rapids'],
      'cudf': ['cudf'],
      'cupy': ['cupy'],
      'numba': ['numba'],
      'cython': ['cython'],
      'pypy': ['pypy'],
      'julia': ['julia'],
      'r': ['r'],
      'matlab': ['matlab'],
      'octave': ['octave'],
      'scala': ['scala'],
      'clojure': ['clojure'],
      'haskell': ['haskell'],
      'erlang': ['erlang'],
      'elixir': ['elixir'],
      'f#': ['f#', 'fsharp'],
      'ocaml': ['ocaml'],
      'lisp': ['lisp'],
      'scheme': ['scheme'],
      'prolog': ['prolog'],
      'smalltalk': ['smalltalk'],
      'ada': ['ada'],
      'cobol': ['cobol'],
      'fortran': ['fortran'],
      'pascal': ['pascal'],
      'delphi': ['delphi'],
      'vb': ['vb', 'visual basic'],
      'vb.net': ['vb.net'],
      'asp.net': ['asp.net'],
      'mvc': ['mvc', 'model view controller'],
      'mvp': ['mvp', 'model view presenter'],
      'mvvm': ['mvvm', 'model view viewmodel'],
      'mvi': ['mvi', 'model view intent'],
      'flux': ['flux'],
      'redux': ['redux'],
      'mobx': ['mobx'],
      'zustand': ['zustand'],
      'jotai': ['jotai'],
      'recoil': ['recoil'],
      'context': ['context', 'react context'],
      'hooks': ['hooks', 'react hooks'],
      'hoc': ['hoc', 'higher order component'],
      'render props': ['render props'],
      'children as function': ['children as function'],
      'compound component': ['compound component'],
      'controlled component': ['controlled component'],
      'uncontrolled component': ['uncontrolled component'],
      'pure component': ['pure component'],
      'memo': ['memo', 'react.memo'],
      'usememo': ['usememo', 'useMemo'],
      'usecallback': ['usecallback', 'useCallback'],
      'useeffect': ['useeffect', 'useEffect'],
      'usestate': ['usestate', 'useState'],
      'usereducer': ['usereducer', 'useReducer'],
      'usecontext': ['usecontext', 'useContext'],
      'useref': ['useref', 'useRef'],
      'useimperativehandle': ['useimperativehandle', 'useImperativeHandle'],
      'uselayouteffect': ['uselayouteffect', 'useLayoutEffect'],
      'usedebugvalue': ['usedebugvalue', 'useDebugValue'],
      'custom hooks': ['custom hooks'],
      'forwardref': ['forwardref', 'forwardRef'],
      'lazy': ['lazy', 'lazy loading'],
      'suspense': ['suspense'],
      'error boundary': ['error boundary'],
      'portal': ['portal', 'react portal'],
      'fragment': ['fragment', 'react fragment'],
      'strict mode': ['strict mode'],
      'profiler': ['profiler', 'react profiler'],
      'concurrent mode': ['concurrent mode'],
      'time slicing': ['time slicing'],
      'scheduler': ['scheduler'],
      'fiber': ['fiber', 'react fiber'],
      'reconciliation': ['reconciliation'],
      'virtual dom': ['virtual dom'],
      'diffing algorithm': ['diffing algorithm'],
      'keys': ['keys', 'react keys'],
      'refs': ['refs', 'react refs'],
      'lifecycle': ['lifecycle', 'component lifecycle'],
      'mounting': ['mounting'],
      'updating': ['updating'],
      'unmounting': ['unmounting'],
      'error handling': ['error handling'],
      'error boundaries': ['error boundaries'],
      'try catch': ['try catch'],
      'promises': ['promises'],
      'async await': ['async await'],
      'generators': ['generators'],
      'iterators': ['iterators'],
      'symbols': ['symbols'],
      'proxies': ['proxies'],
      'reflect': ['reflect'],
      'weakmap': ['weakmap'],
      'weakset': ['weakset'],
      'map': ['map'],
      'set': ['set'],
      'array methods': ['array methods'],
      'object methods': ['object methods'],
      'string methods': ['string methods'],
      'number methods': ['number methods'],
      'date methods': ['date methods'],
      'math methods': ['math methods'],
      'json': ['json'],
      'xml': ['xml'],
      'yaml': ['yaml'],
      'toml': ['toml'],
      'ini': ['ini'],
      'csv': ['csv'],
      'tsv': ['tsv'],
      'excel': ['excel'],
      'pdf': ['pdf'],
      'doc': ['doc'],
      'docx': ['docx'],
      'ppt': ['ppt'],
      'pptx': ['pptx'],
      'xls': ['xls'],
      'xlsx': ['xlsx'],
      'odt': ['odt'],
      'ods': ['ods'],
      'odp': ['odp'],
      'rtf': ['rtf'],
      'txt': ['txt'],
      'md': ['md', 'markdown'],
      'html': ['html'],
      'css': ['css'],
      'js': ['js', 'javascript'],
      'ts': ['ts', 'typescript'],
      'jsx': ['jsx'],
      'tsx': ['tsx'],
      'vue': ['vue'],
      'svelte': ['svelte'],
      'angular': ['angular'],
      'ember': ['ember'],
      'backbone': ['backbone'],
      'knockout': ['knockout'],
      'jquery': ['jquery'],
      'lodash': ['lodash'],
      'underscore': ['underscore'],
      'ramda': ['ramda'],
      'immutable': ['immutable'],
      'mobx': ['mobx'],
      'rxjs': ['rxjs'],
      'xstream': ['xstream'],
      'most': ['most'],
      'bacon': ['bacon'],
      'flyd': ['flyd'],
      'kefir': ['kefir'],
      'highland': ['highland'],
      'async': ['async'],
      'bluebird': ['bluebird'],
      'q': ['q'],
      'when': ['when'],
      'rsvp': ['rsvp'],
      'deferred': ['deferred'],
      'future': ['future'],
      'task': ['task'],
      'io': ['io'],
      'maybe': ['maybe'],
      'either': ['either'],
      'validation': ['validation'],
      'sanctuary': ['sanctuary'],
      'folktale': ['folktale'],
      'fantasy land': ['fantasy land'],
      'monad': ['monad'],
      'functor': ['functor'],
      'applicative': ['applicative'],
      'semigroup': ['semigroup'],
      'monoid': ['monoid'],
      'foldable': ['foldable'],
      'traversable': ['traversable'],
      'bifunctor': ['bifunctor'],
      'contravariant': ['contravariant'],
      'profunctor': ['profunctor'],
      'comonad': ['comonad'],
      'extend': ['extend'],
      'compose': ['compose'],
      'pipe': ['pipe'],
      'curry': ['curry'],
      'partial application': ['partial application'],
      'closure': ['closure'],
      'scope': ['scope'],
      'hoisting': ['hoisting'],
      'this': ['this'],
      'bind': ['bind'],
      'call': ['call'],
      'apply': ['apply'],
      'prototype': ['prototype'],
      'inheritance': ['inheritance'],
      'polymorphism': ['polymorphism'],
      'encapsulation': ['encapsulation'],
      'abstraction': ['abstraction'],
      'composition': ['composition'],
      'aggregation': ['aggregation'],
      'association': ['association'],
      'dependency injection': ['dependency injection'],
      'inversion of control': ['inversion of control'],
      'single responsibility': ['single responsibility'],
      'open closed': ['open closed'],
      'liskov substitution': ['liskov substitution'],
      'interface segregation': ['interface segregation'],
      'dependency inversion': ['dependency inversion'],
      'dry': ['dry', 'don\'t repeat yourself'],
      'kiss': ['kiss', 'keep it simple stupid'],
      'yagni': ['yagni', 'you aren\'t gonna need it'],
      'solid': ['solid'],
      'grasp': ['grasp'],
      'clean code': ['clean code'],
      'refactoring': ['refactoring'],
      'design patterns': ['design patterns'],
      'creational patterns': ['creational patterns'],
      'structural patterns': ['structural patterns'],
      'behavioral patterns': ['behavioral patterns'],
      'singleton': ['singleton'],
      'factory': ['factory'],
      'abstract factory': ['abstract factory'],
      'builder': ['builder'],
      'prototype': ['prototype'],
      'adapter': ['adapter'],
      'bridge': ['bridge'],
      'composite': ['composite'],
      'decorator': ['decorator'],
      'facade': ['facade'],
      'flyweight': ['flyweight'],
      'proxy': ['proxy'],
      'chain of responsibility': ['chain of responsibility'],
      'command': ['command'],
      'interpreter': ['interpreter'],
      'iterator': ['iterator'],
      'mediator': ['mediator'],
      'memento': ['memento'],
      'observer': ['observer'],
      'state': ['state'],
      'strategy': ['strategy'],
      'template method': ['template method'],
      'visitor': ['visitor'],
      'mvc': ['mvc', 'model view controller'],
      'mvp': ['mvp', 'model view presenter'],
      'mvvm': ['mvvm', 'model view viewmodel'],
      'mvi': ['mvi', 'model view intent'],
      'flux': ['flux'],
      'redux': ['redux'],
      'mobx': ['mobx'],
      'zustand': ['zustand'],
      'jotai': ['jotai'],
      'recoil': ['recoil'],
      'context': ['context', 'react context'],
      'hooks': ['hooks', 'react hooks'],
      'hoc': ['hoc', 'higher order component'],
      'render props': ['render props'],
      'children as function': ['children as function'],
      'compound component': ['compound component'],
      'controlled component': ['controlled component'],
      'uncontrolled component': ['uncontrolled component'],
      'pure component': ['pure component'],
      'memo': ['memo', 'react.memo'],
      'usememo': ['usememo', 'useMemo'],
      'usecallback': ['usecallback', 'useCallback'],
      'useeffect': ['useeffect', 'useEffect'],
      'usestate': ['usestate', 'useState'],
      'usereducer': ['usereducer', 'useReducer'],
      'usecontext': ['usecontext', 'useContext'],
      'useref': ['useref', 'useRef'],
      'useimperativehandle': ['useimperativehandle', 'useImperativeHandle'],
      'uselayouteffect': ['uselayouteffect', 'useLayoutEffect'],
      'usedebugvalue': ['usedebugvalue', 'useDebugValue'],
      'custom hooks': ['custom hooks'],
      'forwardref': ['forwardref', 'forwardRef'],
      'lazy': ['lazy', 'lazy loading'],
      'suspense': ['suspense'],
      'error boundary': ['error boundary'],
      'portal': ['portal', 'react portal'],
      'fragment': ['fragment', 'react fragment'],
      'strict mode': ['strict mode'],
      'profiler': ['profiler', 'react profiler'],
      'concurrent mode': ['concurrent mode'],
      'time slicing': ['time slicing'],
      'scheduler': ['scheduler'],
      'fiber': ['fiber', 'react fiber'],
      'reconciliation': ['reconciliation'],
      'virtual dom': ['virtual dom'],
      'diffing algorithm': ['diffing algorithm'],
      'keys': ['keys', 'react keys'],
      'refs': ['refs', 'react refs'],
      'lifecycle': ['lifecycle', 'component lifecycle'],
      'mounting': ['mounting'],
      'updating': ['updating'],
      'unmounting': ['unmounting'],
      'error handling': ['error handling'],
      'error boundaries': ['error boundaries'],
      'try catch': ['try catch'],
      'promises': ['promises'],
      'async await': ['async await'],
      'generators': ['generators'],
      'iterators': ['iterators'],
      'symbols': ['symbols'],
      'proxies': ['proxies'],
      'reflect': ['reflect'],
      'weakmap': ['weakmap'],
      'weakset': ['weakset'],
      'map': ['map'],
      'set': ['set'],
      'array methods': ['array methods'],
      'object methods': ['object methods'],
      'string methods': ['string methods'],
      'number methods': ['number methods'],
      'date methods': ['date methods'],
      'math methods': ['math methods'],
      'json': ['json'],
      'xml': ['xml'],
      'yaml': ['yaml'],
      'toml': ['toml'],
      'ini': ['ini'],
      'csv': ['csv'],
      'tsv': ['tsv'],
      'excel': ['excel'],
      'pdf': ['pdf'],
      'doc': ['doc'],
      'docx': ['docx'],
      'ppt': ['ppt'],
      'pptx': ['pptx'],
      'xls': ['xls'],
      'xlsx': ['xlsx'],
      'odt': ['odt'],
      'ods': ['ods'],
      'odp': ['odp'],
      'rtf': ['rtf'],
      'txt': ['txt'],
      'md': ['md', 'markdown'],
      'html': ['html'],
      'css': ['css'],
      'js': ['js', 'javascript'],
      'ts': ['ts', 'typescript'],
      'jsx': ['jsx'],
      'tsx': ['tsx'],
      'vue': ['vue'],
      'svelte': ['svelte'],
      'angular': ['angular'],
      'ember': ['ember'],
      'backbone': ['backbone'],
      'knockout': ['knockout'],
      'jquery': ['jquery'],
      'lodash': ['lodash'],
      'underscore': ['underscore'],
      'ramda': ['ramda'],
      'immutable': ['immutable'],
      'mobx': ['mobx'],
      'rxjs': ['rxjs'],
      'xstream': ['xstream'],
      'most': ['most'],
      'bacon': ['bacon'],
      'flyd': ['flyd'],
      'kefir': ['kefir'],
      'highland': ['highland'],
      'async': ['async'],
      'bluebird': ['bluebird'],
      'q': ['q'],
      'when': ['when'],
      'rsvp': ['rsvp'],
      'deferred': ['deferred'],
      'future': ['future'],
      'task': ['task'],
      'io': ['io'],
      'maybe': ['maybe'],
      'either': ['either'],
      'validation': ['validation'],
      'sanctuary': ['sanctuary'],
      'folktale': ['folktale'],
      'fantasy land': ['fantasy land'],
      'monad': ['monad'],
      'functor': ['functor'],
      'applicative': ['applicative'],
      'semigroup': ['semigroup'],
      'monoid': ['monoid'],
      'foldable': ['foldable'],
      'traversable': ['traversable'],
      'bifunctor': ['bifunctor'],
      'contravariant': ['contravariant'],
      'profunctor': ['profunctor'],
      'comonad': ['comonad'],
      'extend': ['extend'],
      'compose': ['compose'],
      'pipe': ['pipe'],
      'curry': ['curry'],
      'partial application': ['partial application'],
      'closure': ['closure'],
      'scope': ['scope'],
      'hoisting': ['hoisting'],
      'this': ['this'],
      'bind': ['bind'],
      'call': ['call'],
      'apply': ['apply'],
      'prototype': ['prototype'],
      'inheritance': ['inheritance'],
      'polymorphism': ['polymorphism'],
      'encapsulation': ['encapsulation'],
      'abstraction': ['abstraction'],
      'composition': ['composition'],
      'aggregation': ['aggregation'],
      'association': ['association'],
      'dependency injection': ['dependency injection'],
      'inversion of control': ['inversion of control'],
      'single responsibility': ['single responsibility'],
      'open closed': ['open closed'],
      'liskov substitution': ['liskov substitution'],
      'interface segregation': ['interface segregation'],
      'dependency inversion': ['dependency inversion'],
      'dry': ['dry', 'don\'t repeat yourself'],
      'kiss': ['kiss', 'keep it simple stupid'],
      'yagni': ['yagni', 'you aren\'t gonna need it'],
      'solid': ['solid'],
      'grasp': ['grasp'],
      'clean code': ['clean code'],
      'refactoring': ['refactoring'],
      'design patterns': ['design patterns'],
      'creational patterns': ['creational patterns'],
      'structural patterns': ['structural patterns'],
      'behavioral patterns': ['behavioral patterns'],
      'singleton': ['singleton'],
      'factory': ['factory'],
      'abstract factory': ['abstract factory'],
      'builder': ['builder'],
      'prototype': ['prototype'],
      'adapter': ['adapter'],
      'bridge': ['bridge'],
      'composite': ['composite'],
      'decorator': ['decorator'],
      'facade': ['facade'],
      'flyweight': ['flyweight'],
      'proxy': ['proxy'],
      'chain of responsibility': ['chain of responsibility'],
      'command': ['command'],
      'interpreter': ['interpreter'],
      'iterator': ['iterator'],
      'mediator': ['mediator'],
      'memento': ['memento'],
      'observer': ['observer'],
      'state': ['state'],
      'strategy': ['strategy'],
      'template method': ['template method'],
      'visitor': ['visitor']
    };

    const inferredTechs: string[] = [];
    Object.entries(titleToTechMap).forEach(([tech, variations]) => {
      if (variations.some(variation => normalizedJobTitle.includes(variation))) {
        inferredTechs.push(tech);
      }
    });

    if (inferredTechs.length > 0) {
      const matchingSkills = normalizedUserSkills.filter(userSkill => 
        inferredTechs.some(tech => tech.includes(userSkill) || userSkill.includes(tech))
      );
      return Math.round((matchingSkills.length / Math.max(userSkills.length, 1)) * 100);
    }
    return 0;
  }

  // Cálculo normal com tecnologias definidas
  const matchingSkills = normalizedUserSkills.filter(userSkill => 
    normalizedJobTechs.some(jobTech => jobTech.includes(userSkill) || userSkill.includes(jobTech))
  );

  return Math.round((matchingSkills.length / Math.max(userSkills.length, 1)) * 100);
};

// Função para calcular compatibilidade de experiência
const calculateExperienceCompatibility = (userExperience: string, jobExperience: string): number => {
  if (!userExperience || !jobExperience) {
    return 50; // Valor neutro se não há informação
  }

  const userExp = userExperience.toLowerCase();
  const jobExp = jobExperience.toLowerCase();

  // Mapeamento de níveis de experiência
  const experienceLevels = {
    'estágio': 1,
    'estagiário': 1,
    'trainee': 1,
    'júnior': 2,
    'junior': 2,
    'pleno': 3,
    'sênior': 4,
    'senior': 4,
    'especialista': 5,
    'expert': 5,
    'lead': 6,
    'tech lead': 6,
    'arquiteto': 7,
    'architect': 7,
    'diretor': 8,
    'director': 8,
    'cto': 9,
    'vp': 9
  };

  const getUserLevel = (exp: string) => {
    for (const [key, level] of Object.entries(experienceLevels)) {
      if (exp.includes(key)) {
        return level;
      }
    }
    return 3; // Default para pleno
  };

  const userLevel = getUserLevel(userExp);
  const jobLevel = getUserLevel(jobExp);

  const diff = Math.abs(userLevel - jobLevel);
  
  if (diff === 0) return 100;
  if (diff === 1) return 80;
  if (diff === 2) return 60;
  if (diff === 3) return 40;
  return 20;
};

// Função para calcular compatibilidade de localização
const calculateLocationCompatibility = (userLocation: string, jobLocation: string, isRemote: boolean): number => {
  if (isRemote) {
    return 100; // Trabalho remoto é sempre compatível
  }

  if (!userLocation || !jobLocation) {
    return 50; // Valor neutro se não há informação
  }

  const userLoc = userLocation.toLowerCase();
  const jobLoc = jobLocation.toLowerCase();

  // Se são exatamente iguais
  if (userLoc === jobLoc) {
    return 100;
  }

  // Se contém a mesma cidade/estado
  if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) {
    return 80;
  }

  // Se são do mesmo estado (Brasil)
  const brazilianStates = {
    'sp': ['são paulo', 'sao paulo'],
    'rj': ['rio de janeiro'],
    'mg': ['minas gerais'],
    'rs': ['rio grande do sul'],
    'pr': ['paraná', 'parana'],
    'sc': ['santa catarina'],
    'ba': ['bahia'],
    'go': ['goiás', 'goias'],
    'pe': ['pernambuco'],
    'ce': ['ceará', 'ceara'],
    'pa': ['pará', 'para'],
    'ma': ['maranhão', 'maranhao'],
    'al': ['alagoas'],
    'se': ['sergipe'],
    'pb': ['paraíba', 'paraiba'],
    'rn': ['rio grande do norte'],
    'pi': ['piauí', 'piaui'],
    'to': ['tocantins'],
    'ac': ['acre'],
    'ro': ['rondônia', 'rondonia'],
    'rr': ['roraima'],
    'ap': ['amapá', 'amapa'],
    'am': ['amazonas'],
    'mt': ['mato grosso'],
    'ms': ['mato grosso do sul'],
    'df': ['distrito federal', 'brasília', 'brasilia']
  };

  for (const [state, cities] of Object.entries(brazilianStates)) {
    const userInState = cities.some(city => userLoc.includes(city));
    const jobInState = cities.some(city => jobLoc.includes(city));
    
    if (userInState && jobInState) {
      return 70;
    }
  }

  return 30; // Localizações diferentes
};
