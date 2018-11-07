import { Sport } from './sport';
import { Country } from './country';

export class Competition{
    constructor(
        public id: number,
        public name: string,
        public status:number,
        public country: Country,
        public sport: Sport,
        public userId:string,
        public createdAt:Date

    ){}
}