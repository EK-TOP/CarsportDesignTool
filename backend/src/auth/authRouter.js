import { Router } from 'express';

const validCredentials = ({ email, username, password }) => typeof email === 'string' && email.includes('@') && typeof username === 'string' && username.length >= 3 && typeof password === 'string' && password.length >= 12;
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 };

export function createAuthRouter(authService) {
  const router = Router();
  router.post('/auth/register', async (request, response, next) => { try { if (!validCredentials(request.body ?? {})) return response.status(400).json({ error: 'Email, username, and a 12-character password are required' }); const result = await authService.register(request.body); response.cookie('carsport_access', result.token, cookieOptions).status(201).json({ data: result.user }); } catch (error) { if (error.code === 'P2002') return response.status(409).json({ error: 'Email or username is already registered' }); return next(error); } });
  router.post('/auth/login', async (request, response, next) => { try { const { identity, password } = request.body ?? {}; if (typeof identity !== 'string' || typeof password !== 'string') return response.status(400).json({ error: 'Email or username and password are required' }); const result = await authService.login({ identity, password }); if (!result) return response.status(401).json({ error: 'Invalid credentials' }); return response.cookie('carsport_access', result.token, cookieOptions).json({ data: result.user }); } catch (error) { return next(error); } });
  router.post('/auth/logout', (_request, response) => response.clearCookie('carsport_access', cookieOptions).status(204).end());
  router.get('/auth/me', async (request, response) => response.json({ data: request.user }));
  return router;
}
