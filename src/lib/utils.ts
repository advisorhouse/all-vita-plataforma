import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isColorLight(color: string | null | undefined): boolean {
  if (!color) return true;
  
  // If it's a CSS variable, we can't easily check, but we assume it's light for safety or dark
  if (color.startsWith('var')) return true;

  // Handle hex colors
  let hex = color;
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  } else if (!/^[0-9A-F]{3,6}$/i.test(hex)) {
    // Not a hex color, return true (assuming light) as fallback
    return true;
  }
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  if (hex.length !== 6) return true;
  
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Using relative luminance formula
  // 0.299*R + 0.587*G + 0.114*B
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180; // Adjusted threshold
}
