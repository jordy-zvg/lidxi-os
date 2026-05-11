import preset from '@lidxi/tokens/tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: ['./app/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
