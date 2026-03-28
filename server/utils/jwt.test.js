import { generateToken, verifyToken } from './jwt.js';

// ─── Test Suite 1: generateToken ───────────────────────────────────────
describe('generateToken', () => {

  test('should return a string token', () => {
    const user = { id: '123', email: 'harsh@test.com', name: 'Harsh' };
    const token = generateToken(user);
    expect(typeof token).toBe('string');
  });

  test('should contain correct email in payload', () => {
    const user = { id: '123', email: 'harsh@test.com', name: 'Harsh' };
    const token = generateToken(user);
    const decoded = verifyToken(token);
    expect(decoded.email).toBe('harsh@test.com');
  });

  test('should contain correct name in payload', () => {
    const user = { id: '123', email: 'harsh@test.com', name: 'Harsh' };
    const token = generateToken(user);
    const decoded = verifyToken(token);
    expect(decoded.name).toBe('Harsh');
  });

});

// ─── Test Suite 2: verifyToken ─────────────────────────────────────────
describe('verifyToken', () => {

  test('should return null for an invalid token', () => {
    const result = verifyToken('this.is.a.fake.token');
    expect(result).toBeNull();
  });

  test('should return null for an empty string', () => {
    const result = verifyToken('');
    expect(result).toBeNull();
  });

});