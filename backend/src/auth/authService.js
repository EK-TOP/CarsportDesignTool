import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function createAuthService({ prisma, jwtSecret }) {
  const publicUser = ({ id, email, username, role }) => ({ id, email, username, role });
  const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
  async function register({ email, username, password }) {
    const user = await prisma.user.create({ data: { email: email.toLowerCase(), username, passwordHash: await bcrypt.hash(password, 12) } });
    return { user: publicUser(user), token: tokenFor(user) };
  }
  async function login({ identity, password }) {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identity.toLowerCase() }, { username: identity }] } });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return null;
    return { user: publicUser(user), token: tokenFor(user) };
  }
  async function currentUser(id) { const user = await prisma.user.findUnique({ where: { id } }); return user ? publicUser(user) : null; }
  return { register, login, currentUser };
}
