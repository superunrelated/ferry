import { cva, type VariantProps } from 'class-variance-authority';

export { cva, type VariantProps };

export function vi(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

