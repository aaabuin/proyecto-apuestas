import { Bookie } from './bookie';
import { Event } from './event';
import { User } from './user';

export class Pick{
    constructor(
        public id: number,
        public pick: string,
        public odd:number,
        public result: number,
        public event: Event,
        public betId:number

    ){}
}