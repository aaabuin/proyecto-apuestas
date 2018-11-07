export class User{
    constructor(
        public id: number,
        public username: string,
        public email: string,
        public password: string,
        public avatar: string,
        public description: string,
        public role: number
    ){}
}