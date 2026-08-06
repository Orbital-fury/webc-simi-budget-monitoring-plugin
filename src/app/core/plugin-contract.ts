/**
 * Contrat d'interface avec le Hub (webc-simi-hub), redefini localement en
 * duck-typing (memes noms/formes que
 * `webc-simi-hub/src/app/core/models/plugin-contract.model.ts` et
 * `webc-simi-hub/src/app/core/db/hub-database.ts`), sans importer le code du
 * Hub : le plugin reste buildable et deployable de maniere independante.
 */

export const PLUGIN_NAVIGATE_EVENT = 'plugin-navigate';
export const PLUGIN_ACTION_EVENT = 'plugin-action';

export interface PluginNavigateDetail {
  /** Segment de route interne, sans slash de tete (ex. `''`, `'plans'`, `'checkout'`). */
  readonly path: string;
}

export type ToastVariant = 'info' | 'success' | 'error';

export interface PluginActionDetail {
  readonly type: string;
  readonly payload?: unknown;
}
