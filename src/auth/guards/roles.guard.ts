import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('RolesGuard - canActivate called');
    // 1️⃣ Read roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 2️⃣ If no roles specified → allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // 3️⃣ Get logged-in user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    console.log('RolesGuard - User Role:', user.role);

    // 4️⃣ Check role
    return requiredRoles.includes(user.role);
  }
}
