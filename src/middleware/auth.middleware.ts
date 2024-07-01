import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * this middleware is used to authorize every req
 * 
 * 
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
    ) {}
    
    async use(req: Request, res: Response, next: Function) {
        var token;
        var isAuthorized = false;
        if(req.headers['authorization']) {
            token = req.headers['authorization'];
            token = token.replace('Bearer ', '');
            if(token == process.env.AUTH_TOKEN) {
                isAuthorized = true;
            }
        }

        if(!isAuthorized) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }
        next();
    }
}
