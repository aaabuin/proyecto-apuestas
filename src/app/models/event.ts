import { Competition } from './competition';

export class Event{
    constructor(
        public id: number,
        public name: string,
        public date: string,
        public competition: Competition,
        public userId:string,
        public createdAt:Date

    ){}
}