import { User } from './user';

export class Stats{
    constructor(
        public user: User,
        public numPicks: number,
        public numWins: number,
        public numFails: number,
        public numVoids: number,
        public numPendings: number,
        public numRejected: number,
        public stakedUnits: number,
        public stakeAverage: number,
        public wonUnits: number,
        public lostUnits: number,
        public profit: number,
        public oddRate: number,
        public winRate: number,
        public yieldPercent: number

    ){}
}