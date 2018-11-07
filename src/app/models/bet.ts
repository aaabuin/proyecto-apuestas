import { Bookie } from './bookie';
import { User } from './user';
import { Pick } from './pick';

export class Bet{
    constructor(
        public id: number,
        public stake: number,
        public argument:string,
        public bookie : Bookie,
        public user: User,
        public createdAt: Date,
        public updatedAt: Date,
        public picks: Array<Pick>

    ){}
}