import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
//accepting role names
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
