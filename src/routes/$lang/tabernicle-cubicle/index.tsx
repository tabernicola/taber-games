import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Flame, Hammer, Egg, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/platform/layout/SiteHeader';
import { useI18n, langFromSlug } from '@/platform/i18n';
import { pageMeta } from '@/platform/seo';
import { translations } from '@/games/tabernicle-cubicle/i18n';
import taber from '@/assets/taber-cubicle.png.asset.json';
export const Route=createFileRoute('/$lang/tabernicle-cubicle/')({head:({params})=>({meta:pageMeta({title:'Tabernicle Cubicle — The Taber Games',description:translations[langFromSlug(params.lang)??'es']['tc.desc']})}),component:Lobby});
function Lobby(){const {t,slug}=useI18n();return <div className="tc-scope min-h-screen"><SiteHeader/><main className="tc-lobby mx-auto max-w-3xl px-5 py-8"><Button asChild variant="ghost" className="mb-6"><Link to="/$lang" params={{lang:slug}}><ArrowLeft/>{t('tc.back')}</Link></Button><div className="text-center"><img src={taber.url} alt="Taber" className="mx-auto h-52 w-64 object-contain"/><h1 className="mt-5 font-display text-3xl sm:text-4xl">Tabernicle Cubicle</h1><p className="mt-3 text-base">{t('tc.desc')}</p><div className="my-7 flex justify-center gap-7"><Flame size={28}/><Hammer size={28}/><Egg size={28}/></div><h2 className="font-display text-xl">{t('tc.level')}</h2><p className="mx-auto mb-7 mt-4 max-w-lg leading-relaxed">{t('tc.rules')}</p><Button asChild className="tc-action" size="lg"><Link to="/$lang/tabernicle-cubicle/play" params={{lang:slug}}><Play/>{t('tc.play')}</Link></Button></div></main></div>;}
