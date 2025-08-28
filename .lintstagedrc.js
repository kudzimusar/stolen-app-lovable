module.exports = {
  // Run ESLint on staged TypeScript/JavaScript files
  '**/*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Run Prettier on staged files
  '**/*.{json,css,md,html}': [
    'prettier --write',
  ],
  
  // Run TypeScript type checking on staged TypeScript files
  '**/*.{ts,tsx}': [
    'tsc --noEmit',
  ],
};