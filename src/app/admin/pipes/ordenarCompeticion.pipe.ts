import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ordenarCompeticion'
})

@Injectable()
export class ordenarCompeticion implements PipeTransform{

 transform(array, orderBy, order){
     if (array){

        if (!orderBy || orderBy.trim() == ""){
        return array;
        } 


        if (order=="asc"){
        return array.sort((item1: any, item2: any) => { 
            if(orderBy=="sport") return this.orderByComparator(item1.sport.name, item2.sport.name);
            if(orderBy=="country" )return this.orderByComparator(item1.country.name, item2.country.name);
            if(orderBy=="status" )return this.orderByComparator(item1.status, item2.status);
            else return this.orderByComparator(item1.name, item2.name);
            //en ultimo caso ordenamos por nombre
        });
        }
        else{
        return array.sort((item1: any, item2: any) => { 
            if(orderBy=="sport") return this.orderByComparator(item2.sport.name, item1.sport.name);
            if(orderBy=="country" )return this.orderByComparator(item2.country.name, item1.country.name);
            if(orderBy=="status" )return this.orderByComparator(item2.status, item1.status);
            else return this.orderByComparator(item2.name, item1.name);
        });
        }
    }
 }
 
 orderByComparator(a:any, b:any):number{
 
    if(a.toLowerCase() < b.toLowerCase()) return -1;
    if(a.toLowerCase() > b.toLowerCase()) return 1;

    return 0; //equal each other
 }
}

