import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {User} from "./types/user.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const decodeToken = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
