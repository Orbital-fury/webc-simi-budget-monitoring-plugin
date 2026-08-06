import { Frequence } from './models';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  salaire: number;
  budget: number;
  created: string;
  updated: string;
}

/** Enregistrement PocketBase de la collection `aboCategories`. */
export interface CategorieRecord {
  id: string;
  name: string;
  hexaColor: string;
}

/**
 * Enregistrement PocketBase de la collection `abonnements` (`periodes` en champ JSON).
 * `categorie` est un champ relation : seul l'id est stocké côté PocketBase, la donnée
 * complète n'est disponible que si la requête demande `expand: 'categorie'`.
 */
export interface AbonnementRecord {
  id: string;
  user: string;
  montant: number;
  categorie: string;
  libelle: string;
  frequence: Frequence;
  periodes: { debut: string; fin: string | null }[];
  created: string;
  updated: string;
  expand?: {
    categorie?: CategorieRecord;
  };
}
