import { Bookie } from './bookie';
import { User } from './user';
import { Bet } from './bet';
import { SubscriptionPick } from './subscriptionPick';

export class SubscriptionBet{
    constructor(
        public id: number,
        public amount: number,
        public coment:string,
        public bookie : Bookie,
        public user: User,
        public createdAt: Date,
        public updatedAt: Date,
        public picks: Array<SubscriptionPick>,
        public bet: Bet
    ){}
}