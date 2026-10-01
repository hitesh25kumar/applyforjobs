import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(private readonly firebaseService: FirebaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            const decodedToken = await this.firebaseService.verifyIdToken(token);

            // Attach Firebase user info to request object
            request.user = {
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid authentication token');
        }
    }

    private extractTokenFromHeader(request: any): string | null {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return null;
        }

        // Expected format: "Bearer <token>"
        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return null;
        }

        return token;
    }
}
