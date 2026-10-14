import { sequence } from 'astro:middleware';
import { portalMiddleware } from './portal/middleware';

// O middleware da plataforma vem primeiro; middlewares próprios do cliente entram depois dele.
export const onRequest = sequence(portalMiddleware);
