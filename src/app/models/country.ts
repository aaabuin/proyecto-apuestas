export class Country{
    constructor(
        public id: number,
        public name: string,
        public image: string,
        public status: number,
        public userId:number,
        public createdAt:Date
    ){}
}