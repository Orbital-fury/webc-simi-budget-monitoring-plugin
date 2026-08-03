import { Categorie, Periode } from '../models';

export const CATEGORIES: readonly Categorie[] = [
  'Courses',
  'Loyer',
  'Loisirs',
  'Transport',
  'Autre',
];

/** Couleur associée à chaque catégorie. */
export const CATEGORY_COLORS: Record<Categorie, string> = {
  Courses: '#6366f1',
  Loyer: '#ef4444',
  Loisirs: '#f59e0b',
  Transport: '#10b981',
  Autre: '#6b7280',
} as const;

/** Formate un montant en euros (français). Ex : 1234.5 -> "1 234,50 €". */
export function formatEuros(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(montant);
}

export function formatEurosCompact(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: montant % 1 === 0 ? 0 : 2,
  }).format(montant);
}

/** Retourne la valeur de couleur calculée d'une catégorie (depuis les variables CSS). */
export function couleurCategorie(categorie: Categorie): string {
  return CATEGORY_COLORS[categorie];
}

/** Un abonnement est actif tant que sa dernière période n'a pas de date de fin. */
export function estAbonnementActif(periodes: Periode[]): boolean {
  return periodes.some((p) => p.fin === null);
}

/** Parse une chaîne `YYYY-MM-DD` en `Date` locale (midi pour éviter les décalages DST). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Date ISO invalide : ${iso}`);
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
