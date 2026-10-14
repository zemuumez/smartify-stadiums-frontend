import { accounts } from './fixtures';
import type { Role } from '../services/contracts';
export const demoAccountOptions = accounts.map(account => ({ id: account.id, role: account.role, name: account.full_name }));
export function demoAccountForRole(role: Role) { return accounts.find(account => account.role === role)!.id; }
