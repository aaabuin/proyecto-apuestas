import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ordenarApuestasPorFecha'
})

@Injectable()
export class ordenarApuestasPorFecha implements PipeTransform{

 transform(array,details, order="desc"){
     if (array){

        if (order=="asc"){
        return array.sort((item1: any, item2: any) => { 
            return this.orderByComparator(details[item1.id], details[item2.id], item1.id, item2.id);

        });
        }
        else{
        return array.sort((item1: any, item2: any) => { 
            return this.orderByComparator(details[item2.id], details[item1.id], item2.id, item1.id);
            
        });
        }
    }
 }
 
 orderByComparator(a:any, b:any, aId:any=null, bId:any=null):number{
    if(a.date.toLowerCase() < b.date.toLowerCase()) return -1;
    if(a.date.toLowerCase() > b.date.toLowerCase()) return 1;

    //Si dos apuestas tienen la misma fecha, entonces se ordenarán en funcion del ID
    if(a.date.toLowerCase() == b.date.toLowerCase()){
        if(aId < bId) return -1;
        if(aId > bId) return 1;
    }

    return 0; //equal each other
 }
}

