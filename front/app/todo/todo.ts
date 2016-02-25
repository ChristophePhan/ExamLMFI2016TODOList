export class Todo {
    constructor(
        public id:string,
        public text:string,
        public link:string,
        public status?:string,
        public creationDate?:Date,
        public modificationDate?:Date) { }
}
