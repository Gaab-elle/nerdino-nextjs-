import React from 'react';

interface TechIconProps {
  tech: string;
  className?: string;
}

const TechIcon: React.FC<TechIconProps> = ({ tech, className = "w-5 h-5" }) => {
  const techLower = tech.toLowerCase();
  
  // Mapeamento para classes CSS do Devicons
  const getDeviconClass = () => {
    switch (techLower) {
      case 'php':
      case 'php/laravel':
        return 'devicon-php-plain';
      case 'laravel':
        return 'devicon-laravel-plain';
      case 'python':
        return 'devicon-python-plain';
      case 'next.js':
      case 'nextjs':
        return 'devicon-nextjs-plain';
      case 'react':
        return 'devicon-react-original';
      case 'vue':
      case 'vue.js':
        return 'devicon-vuejs-plain';
      case 'node.js':
      case 'nodejs':
        return 'devicon-nodejs-plain';
      case 'javascript':
        return 'devicon-javascript-plain';
      case 'typescript':
        return 'devicon-typescript-plain';
      case 'tailwind':
      case 'tailwind css':
        return 'devicon-tailwindcss-plain';
      case 'postgresql':
        return 'devicon-postgresql-plain';
      case 'mysql':
        return 'devicon-mysql-plain';
      case 'mongodb':
        return 'devicon-mongodb-plain';
      case 'docker':
        return 'devicon-docker-plain';
      case 'git':
        return 'devicon-git-plain';
      case 'github':
        return 'devicon-github-original';
      case 'html':
        return 'devicon-html5-plain';
      case 'css':
        return 'devicon-css3-plain';
      case 'java':
        return 'devicon-java-plain';
      case 'c#':
      case 'csharp':
        return 'devicon-csharp-plain';
      case 'go':
      case 'golang':
        return 'devicon-go-original';
      case 'rust':
        return 'devicon-rust-plain';
      case 'angular':
        return 'devicon-angularjs-plain';
      case 'svelte':
        return 'devicon-svelte-plain';
      case 'express':
        return 'devicon-express-original';
      case 'django':
        return 'devicon-django-plain';
      case 'flask':
        return 'devicon-flask-original';
      case 'redis':
        return 'devicon-redis-plain';
      case 'aws':
        return 'devicon-amazonwebservices-original';
      case 'kubernetes':
        return 'devicon-kubernetes-plain';
      case 'nginx':
        return 'devicon-nginx-original';
      case 'apache':
        return 'devicon-apache-plain';
      case 'linux':
        return 'devicon-linux-plain';
      case 'ubuntu':
        return 'devicon-ubuntu-plain';
      case 'debian':
        return 'devicon-debian-plain';
      case 'centos':
        return 'devicon-centos-plain';
      case 'bootstrap':
        return 'devicon-bootstrap-plain';
      case 'jquery':
        return 'devicon-jquery-plain';
      case 'sass':
        return 'devicon-sass-original';
      case 'less':
        return 'devicon-less-plain-wordmark';
      case 'webpack':
        return 'devicon-webpack-plain';
      case 'vite':
        return 'devicon-vitejs-plain';
      case 'npm':
        return 'devicon-npm-original-wordmark';
      case 'yarn':
        return 'devicon-yarn-plain';
      case 'pnpm':
        return 'devicon-pnpm-original';
      case 'jest':
        return 'devicon-jest-plain';
      case 'cypress':
        return 'devicon-cypressio-plain';
      case 'playwright':
        return 'devicon-playwright-plain';
      case 'graphql':
        return 'devicon-graphql-plain';
      case 'apollo':
        return 'devicon-apollostack-plain';
      case 'prisma':
        return 'devicon-prisma-original';
      case 'supabase':
        return 'devicon-supabase-plain';
      case 'firebase':
        return 'devicon-firebase-plain';
      case 'vercel':
        return 'devicon-vercel-plain';
      case 'netlify':
        return 'devicon-netlify-plain';
      case 'heroku':
        return 'devicon-heroku-plain';
      case 'digitalocean':
        return 'devicon-digitalocean-plain';
      default:
        return 'devicon-code-plain';
    }
  };

  const getTechColor = () => {
    switch (techLower) {
      case 'php':
      case 'php/laravel':
        return '#777BB4';
      case 'laravel':
        return '#FF2D20';
      case 'python':
        return '#3776AB';
      case 'next.js':
      case 'nextjs':
        return '#000000';
      case 'react':
        return '#61DAFB';
      case 'vue':
      case 'vue.js':
        return '#4FC08D';
      case 'node.js':
      case 'nodejs':
        return '#339933';
      case 'javascript':
        return '#F7DF1E';
      case 'typescript':
        return '#3178C6';
      case 'tailwind':
      case 'tailwind css':
        return '#06B6D4';
      case 'postgresql':
        return '#336791';
      case 'mysql':
        return '#4479A1';
      case 'mongodb':
        return '#47A248';
      case 'docker':
        return '#2496ED';
      case 'git':
        return '#F05032';
      case 'github':
        return '#181717';
      case 'html':
        return '#E34F26';
      case 'css':
        return '#1572B6';
      case 'java':
        return '#ED8B00';
      case 'c#':
      case 'csharp':
        return '#239120';
      case 'go':
      case 'golang':
        return '#00ADD8';
      case 'rust':
        return '#000000';
      case 'angular':
        return '#DD0031';
      case 'svelte':
        return '#FF3E00';
      case 'express':
        return '#000000';
      case 'django':
        return '#092E20';
      case 'flask':
        return '#000000';
      case 'redis':
        return '#DC382D';
      case 'aws':
        return '#FF9900';
      case 'kubernetes':
        return '#326CE5';
      case 'nginx':
        return '#009639';
      case 'apache':
        return '#D22128';
      case 'linux':
        return '#FCC624';
      case 'ubuntu':
        return '#E95420';
      case 'debian':
        return '#A81D33';
      case 'centos':
        return '#262577';
      case 'bootstrap':
        return '#7952B3';
      case 'jquery':
        return '#0769AD';
      case 'sass':
        return '#CC6699';
      case 'less':
        return '#1D365D';
      case 'webpack':
        return '#8DD6F9';
      case 'vite':
        return '#646CFF';
      case 'npm':
        return '#CB3837';
      case 'yarn':
        return '#2C8EBB';
      case 'pnpm':
        return '#F69220';
      case 'jest':
        return '#C21325';
      case 'cypress':
        return '#17202C';
      case 'playwright':
        return '#2EAD33';
      case 'graphql':
        return '#E10098';
      case 'apollo':
        return '#311C87';
      case 'prisma':
        return '#2D3748';
      case 'supabase':
        return '#3ECF8E';
      case 'firebase':
        return '#FFCA28';
      case 'vercel':
        return '#000000';
      case 'netlify':
        return '#00C7B7';
      case 'heroku':
        return '#430098';
      case 'digitalocean':
        return '#0080FF';
      default:
        return '#6B7280';
    }
  };

  return (
    <i 
      className={`${getDeviconClass()} ${className}`} 
      style={{ 
        fontSize: '2rem',
        color: getTechColor()
      }}
    ></i>
  );
};

export default TechIcon;
