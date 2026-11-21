import { createFileRoute } from '@tanstack/react-router';
import { Game } from '@/games/tabernicle-cubicle/Game';
import { translations } from '@/games/tabernicle-cubicle/i18n';
import { langFromSlug } from '@/platform/i18n';
import { pageMeta } from '@/platform/seo';
export const Route=createFileRoute('/$lang/tabernicle-cubicle/play')({head:({params})=>({meta:pageMeta({title:'Play Tabernicle Cubicle — The first bridge | The Taber Games',description:translations[langFromSlug(params.lang)??'es']['tc.rules']})}),component:Game});
