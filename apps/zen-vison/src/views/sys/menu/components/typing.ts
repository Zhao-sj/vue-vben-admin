import type { RouteMeta } from '@vben/types';

import type { MenuApi } from '#/api';

interface MenuMeta extends Partial<RouteMeta> {
  icon?: string;
}

interface MetaModel {
  meta: MenuMeta;
}

export type FormState = MetaModel & Partial<MenuApi.AddModel>;
