import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ordenarEventos'
})

@Injectable()
export class ordenarEventos implements PipeTransform{

 transform(array, orderBy, order){
     if (array){

        if (!orderBy || orderBy.trim() == ""){
        return array;
        } 


        if (order=="asc"){
        return array.sort((item1: any, item2: any) => { 
            if(orderBy=="date"){ 
              return this.orderByComparator(item1.date, item2.date);
                   
            }
            if (orderBy=="name") return this.orderByComparator(item1.name, item2.name);
            if (orderBy=="competition") return this.orderByComparator(item1.competition.name, item2.competition.name);
            else return 0;
        });
        }
        else{
        return array.sort((item1: any, item2: any) => { 
           // if(orderBy=="deporte") return this.orderByComparator(item2.deporte.nombre, item1.deporte.nombre);
           if(orderBy=="date"){ 
            return this.orderByComparator(item2.date, item1.date);
        }
        if (orderBy=="name") return this.orderByComparator(item2.name, item1.name);
        if (orderBy=="competition") return this.orderByComparator(item2.competition.name, item1.competition.name);
        else return 0;
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

