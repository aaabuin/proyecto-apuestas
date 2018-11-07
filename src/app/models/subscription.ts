export class Subscription{
    constructor(
        public id: number,
        public followerId: number,
        public tipsterId:number,
        public amount: number,
        public startDate: string,
        public endDate:string

    ){}
}