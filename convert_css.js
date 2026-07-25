const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/index.css');
const content = fs.readFileSync(cssPath, 'utf-8');

const themeRegex = /@theme\s*{([^}]+)}/;
const match = content.match(themeRegex);

if (match) {
  const themeContent = match[1];
  const colorRegex = /--color-([\w-]+):\s*([^;]+);/g;
  
  const colors = {};
  let newThemeContent = '';
  
  let m;
  while ((m = colorRegex.exec(themeContent)) !== null) {
    colors[m[1]] = m[2];
  }
  
  // Create variables
  let cssVariables = '';
  let themeBlock = '@theme {\\n';
  
  const rootVars = [];
  const darkVars = [];
  
  // Light theme approximations (we'll just invert or use lighter colors)
  // For a real app, you'd want carefully selected light theme colors
  const lightColors = {
    'background': '#f8fafc',
    'on-background': '#0f172a',
    'surface': '#ffffff',
    'on-surface': '#0f172a',
    'surface-variant': '#f1f5f9',
    'on-surface-variant': '#475569',
    'primary': '#2563eb',
    'on-primary': '#ffffff',
    'primary-container': '#dbeafe',
    'on-primary-container': '#1e3a8a',
    'secondary': '#7c3aed',
    'on-secondary': '#ffffff',
    'secondary-container': '#ede9fe',
    'on-secondary-container': '#4c1d95',
    'tertiary': '#ea580c',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#ffedd5',
    'on-tertiary-container': '#9a3412',
    'error': '#dc2626',
    'on-error': '#ffffff',
    'error-container': '#fee2e2',
    'on-error-container': '#991b1b',
    'border-glass': 'rgba(0, 0, 0, 0.1)',
    'surface-glass': 'rgba(255, 255, 255, 0.7)',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#f8fafc',
    'surface-container': '#f1f5f9',
    'surface-container-high': '#e2e8f0',
    'surface-container-highest': '#cbd5e1',
    'surface-dim': '#e2e8f0',
    'surface-bright': '#f8fafc',
    'text-muted': '#64748b',
    'outline': '#94a3b8',
    'outline-variant': '#cbd5e1',
    'inverse-surface': '#0f172a',
    'inverse-on-surface': '#f8fafc',
    'inverse-primary': '#60a5fa',
    'glow-blue': 'rgba(37, 99, 235, 0.3)',
    
    // Fallbacks for remaining variants
    'primary-fixed': '#dbeafe',
    'primary-fixed-dim': '#bfdbfe',
    'on-primary-fixed': '#1e3a8a',
    'on-primary-fixed-variant': '#1d4ed8',
    
    'secondary-fixed': '#ede9fe',
    'secondary-fixed-dim': '#ddd6fe',
    'on-secondary-fixed': '#4c1d95',
    'on-secondary-fixed-variant': '#6d28d9',
    
    'tertiary-fixed': '#ffedd5',
    'tertiary-fixed-dim': '#fed7aa',
    'on-tertiary-fixed': '#7c2d12',
    'on-tertiary-fixed-variant': '#9a3412',
  };
  
  for (const [key, darkValue] of Object.entries(colors)) {
    themeBlock += `  --color-${key}: var(--${key});\\n`;
    darkVars.push(`    --${key}: ${darkValue};`);
    
    const lightValue = lightColors[key] || '#ffffff';
    rootVars.push(`    --${key}: ${lightValue};`);
  }
  
  const otherVars = themeContent.replace(/--color-[\w-]+:\s*[^;]+;/g, '').trim();
  themeBlock += `\\n  ${otherVars}\\n}`;
  
  const rootBlock = `\\n@layer base {\\n  :root {\\n${rootVars.join('\\n')}\\n  }\\n\\n  .dark {\\n${darkVars.join('\\n')}\\n  }\\n}`;
  
  const newContent = content.replace(match[0], themeBlock + rootBlock);
  fs.writeFileSync(cssPath, newContent);
  console.log('Successfully updated index.css');
} else {
  console.log('Theme block not found');
}
