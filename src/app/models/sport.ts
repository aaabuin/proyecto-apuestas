import { User } from './user';

export class Sport{
    constructor(
        public id: number,
        public name: string,
        public image: string,
        public status: number,
        public user: User,
        public createdAt: Date
    ){}
}