const BasicLayout = () => import('./basic.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

const AuthPageLayout = () => import('./auth.vue');

export { AuthPageLayout, BasicLayout, IFrameView };
