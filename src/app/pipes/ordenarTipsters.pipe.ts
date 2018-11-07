import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ordenarTipsters'
})

@Injectable()
export class ordenarTipsters implements PipeTransform{

 transform(array, orderBy, order){

     if (array){
        if (!orderBy || orderBy.trim() == ""){
        return array;
        } 
        if (order=="asc"){
        return array.sort((item1: any, item2: any) => { 
            if(orderBy=="yield") return this.orderByComparator(item1.yield, item2.yield);
            if(orderBy=="profit") return this.orderByComparator(item1.profit, item2.profit);
            if(orderBy=="success") return this.orderByComparator(item1.winsAverage, item2.winsAverage);
            if(orderBy=="amountPicks") return this.orderByComparator(item1.numPicks, item2.numPicks);
           // if(orderBy=="pais" )return this.orderByComparator(item1.pais.nombre, item2.pais.nombre);
            else return this.orderByComparator(item1.numPicks, item2.numPicks);
            //en ultimo caso ordenamos por nombre
        });
        }
        else{ 
        return array.sort((item1: any, item2: any) => {
            if(orderBy=="yield") return this.orderByComparator(item2.yield, item1.yield);
            if(orderBy=="profit") return this.orderByComparator(item2.profit, item1.profit);
            if(orderBy=="success") return this.orderByComparator(item2.winsAverage, item1.winsAverage);
            if(orderBy=="amountPicks") return this.orderByComparator(item2.numPicks, item1.numPicks);
           // if(orderBy=="pais" )return this.orderByComparator(item2.pais.nombre, item1.pais.nombre);
            else return this.orderByComparator(item2.numPicks, item1.numPicks);
        });
        }
    }
 }
 
 orderByComparator(a:any, b:any):number{
 
    if(a < b) return -1;
    if(a > b) return 1;

    return 0; //equal each other
 }
}

