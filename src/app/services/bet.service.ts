import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { UserService } from './user.service';
import { PickService } from './pick.service';
import { BookieService } from './bookie.service';
//import { SubscriptionService } from './subscription.service';

import { Bet } from '../models/bet';
/*import { Pick } from '../models/pick';
import { Bookie } from '../models/bookie';
import { Event } from '../models/event';
*/
@Injectable()
export class BetService {
    public url: string;
    public token;

    constructor(
        private _http: Http,
        private _userService: UserService,
        private _pickService: PickService,
        private _bookieService: BookieService,
        //   private _subscriptionService: SubscriptionService
    ) {
        this.url = GLOBAL.url;
        this.token = this._userService.getToken();
    }



    add(bet) {
        let params = JSON.stringify(bet);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url + 'bet/', params, { headers: headers }).map(res => res.json());
        /// this._pronosticoService.addLista(apuesta.pronosticos));
    }


    getById(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/' + id, { headers: headers }).map(res => res.json());
    }

    listMyBets() {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this.completeBettingList(this._http.get(this.url + 'bet/myBets', { headers: headers }).map(res => res.json()));
    }

    //Nos devuelve una lista de apuestas con toda la información completa
    advancedBettingSearch(key) {
        let params = JSON.stringify(key);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this.completeBettingList(this._http.get(this.url + 'bet/advancedSearch/' + params, { headers: headers }).map(res => res.json()));

    }

    //Nos devuelve una lista de apuestas sin la info de la bookie ni del evento
    //Más rapido en caso de tener muchas apuestas en la lista.
    basicBettingSearch(key) {
        let params = JSON.stringify(key);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this.basicBettingList(this._http.get(this.url + 'bet/advancedSearch/' + params, { headers: headers }).map(res => res.json()));

    }

    saveBet(bet) {

        return this.add(bet).toPromise().then(
            id => {
                bet.id = id;
                return this._pickService.addPicksOfBet(bet);
            }
            /*).then(
                r=>{
                    // bet y r contienen lo mismo
                    this._subscriptionService.generateSubscriptionBet(bet);
                }
                */
        ).catch(
            error => {
                return Promise.reject(JSON.parse(error._body).message);
            }
        );
    }


    completeBettingList(bettingList) {

        return bettingList.toPromise().then(bets =>
            Promise.all(bets.map(bet => {
                return this.completeBet(bet);
            }
            )).then(
                fullBet => {
                    console.log("//////"+JSON.stringify(fullBet))
                    return fullBet;
                }
            )
        )



    }

    basicBettingList(bettingList) {
        return bettingList.toPromise().then(bets =>
            Promise.all(bets.map(bet => {
                return this.completeBetBasic(bet);
            }
            )).then(
                fullBet => {
                    return fullBet;
                }
            )
        )
    }

    completeBetBasic(bet) {
        return Promise.all([
            this._pickService.getPicksListWithEvents(bet.id),
            this._userService.getUserById(bet.userId).toPromise()
        ]).then(
            ([picks, user]) => {
                return new Bet(bet.id, bet.stake, bet.argument, bet.bookieId, user, bet.createdAt, bet.updatedAt, picks);
            }
        ).catch(
            (error) => {
                return new Bet(bet.id, bet.stake, bet.argument, bet.bookieId, bet.userId, bet.createdAt, bet.updatedAt, bet.picks);
            }
        );
    }
    completeBetBasicWithBookie(bet) {

        //NO HACE FALTA CARGAR LOS EVENTOS DE LOS PICKS
        //SE COGEN LOS EVENTOS DEL SUBSCRIIPTION PICK CONFIANDO EN QUE ESTÉ EN EL MISMO ORDEN
        //DE CARGAR LOS EVENTOS HABRIA QUE CARGAR COMPETICIONES DEPORTES Y PAISES...PROBLEMAS DE LENTITUD
        
        return Promise.all([
            this._bookieService.getById(bet.bookieId).toPromise(),
            this._pickService.getBasicPicks(bet.id).toPromise(),
            this._userService.getUserById(bet.userId).toPromise()
        ]).then(
            ([bookie, picks, user]) => {
                return new Bet(bet.id, bet.stake, bet.argument, bookie, user, bet.createdAt, bet.updatedAt, picks);
            }
        ).catch(
            (error) => {
                return new Bet(bet.id, bet.stake, bet.argument, bet.bookieId, bet.userId, bet.createdAt, bet.updatedAt, bet.picks);
            }
        );
    }



    completeBet(bet) {
        return Promise.all([
            this._bookieService.getById(bet.bookieId).toPromise(),
            this._pickService.getPicksOfBet(bet.id),
            this._userService.getUserById(bet.userId).toPromise()
        ]).then(
            ([bookie, picks, user]) => {
                return new Bet(bet.id, bet.stake, bet.argument, bookie, user, bet.createdAt, bet.updatedAt, picks);
            }
        ).catch(
            (error) => {
                return new Bet(bet.id, bet.stake, bet.argument, bet.bookieId, bet.userId, bet.createdAt, bet.updatedAt, bet.picks);
            }
        );
    }

    calculateOdd(bet) {
        // PASA COMO EN CALCULATE RESULT
        //ESTAMOS USANDO SOLO ESTE METODO Y NO EL DE SUBSCRIPTIONBET
        //O BORRAR UNO O ARREGLAR PARA QUE SE USEN LOS DOS
        if (bet.picks) {
            let finalOdd = 1;
            bet.picks.forEach(pick => {
                if (pick.result != 3 && pick.result != 8 && pick.result != 12) {
                    finalOdd = finalOdd * pick.odd;
                }

            });
            return Number(finalOdd.toFixed(2));
        } else {
            return 0;
        }
    }

    /* 
    posibles resultados:
    0:pendiente
    1: acierto
    2: fallo
    3: nulo
    4: semifallo
    5: semiacierto
    */
    calculateResult(bet) {
        /* SE USA calculateResult() de subscriptionbet (copiada) ######## 
        USAR SOLO PARA CALCULAR las stats de bettinglist y no de subscriptionbettinlist???
        dejar generico bettinglist y suprimir subcriptionbettinglist???? mirar mas usos del ultimo en caso de eliminarlo
        ################################################################################################################
        */

        if (bet.picks) {
            let finalResult = null;
            bet.picks.forEach(pick => {
                if (finalResult == null) {
                    finalResult = Number(pick.result);
                }
                else {
                    if (pick.result == 2) {
                        finalResult = 2;
                    }
                    if (pick.result == 7 && finalResult != 2) {
                        finalResult = 7;
                    }
                    if (pick.result == 0 && finalResult != 2 && finalResult != 7) {
                        finalResult = 0;
                    }
                    if (pick.result == 11 && finalResult != 2 && finalResult != 7 && finalResult != 0) {
                        finalResult = 11;
                    }

                    if (pick.result == 5 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11) {
                        finalResult = 5;
                    }
                    if (pick.result == 10 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5) {
                        finalResult = 10;
                    }

                    if (pick.result == 4 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10) {
                        finalResult = 4;
                    }
                    if (pick.result == 9 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4) {
                        finalResult = 9;
                    }

                    if (pick.result == 1 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4 && finalResult != 9) {
                        finalResult = 1;
                    }
                    if (pick.result == 6 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4 && finalResult != 9 && finalResult != 1) {
                        finalResult = 6;
                    }
                    if (pick.result == 3 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4 && finalResult != 9 && finalResult != 1 && finalResult != 6) {
                        finalResult = 3;
                    }
                    if (pick.result == 8 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4 && finalResult != 9 && finalResult != 1 && finalResult != 6 && finalResult != 3) {
                        finalResult = 8;
                    }
                    if (pick.result == 12 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5
                        && finalResult != 10 && finalResult != 4 && finalResult != 9 && finalResult != 1 && finalResult != 6 && finalResult != 3
                        && finalResult != 8) {
                        finalResult = 12;
                    }
                }
            });
            return finalResult;
        } else {
            return 0;
        }

        /*
            if (bet.picks) {
                let finalResult = null;
                bet.picks.forEach(pick => {
                    if(finalResult==null){
                        finalResult=Number(pick.result);
                    }
                    if(pick.result==2){
                        finalResult=2;
                    }
                    if(pick.result==0 && finalResult!=2){
                        finalResult=0;
                    }
                    if(pick.result==4 && finalResult!=2 && finalResult!=0){
                        finalResult=4;
                    }
                    if(pick.result==5 && finalResult!=2 && finalResult!=4 && finalResult!=0){
                        finalResult=5;
                    }
                    if(pick.result==1 && finalResult!=2 && finalResult!=4 && finalResult!=5 && finalResult!=0 ){
                        finalResult=1;
                    }
                    if(pick.result==3 && finalResult!=2 && finalResult!=4 && finalResult!=5 && finalResult!=0 && finalResult!=1 ){
                        finalResult=3;
                    }
                });
                return finalResult;
            } else {
                return 0;
            }
    
            */
    }

    calculateDate(bet) {
        if (bet.picks) {
            let finalDate = 0;
            bet.picks.forEach(pick => {
                if (finalDate == 0 || pick.event.date > finalDate)
                    finalDate = pick.event.date;
            });
            return finalDate;
        } else {
            return 0;
        }
    }


    //Texto resumido de los eventos de una apuesta (combinada y simple?)
    calculateEventDescription(bet) {
        if (bet.picks) {
            let desciption = "";
            bet.picks.forEach(pick => {
                if (pick.event.name) {
                    if (desciption == "") {
                        desciption = pick.event.name;
                    } else {
                        desciption = desciption + " + " + pick.event.name;
                    }
                }
            });
            return desciption;
        } else {
            return 0;
        }
    }

    countPendings(bet) {
        let pendings=0;
        if (bet.picks) {
            bet.picks.forEach(pick => {
                    if (pick.result === 0) {
                        pendings++;
                    }
                }
            )
        }
        return pendings;
    }


    calculateCombiDetails(bettingList) {
        let details = {};
        if(bettingList){
            bettingList.forEach(bet => {
                details[bet.id] = { odd: this.calculateOdd(bet), date: this.calculateDate(bet), result: this.calculateResult(bet), description: this.calculateEventDescription(bet), pendings:this.countPendings(bet) };
            });
        }


        return details;
    }


    //borra de la lista de apuestas aquellas que no estén completas
    //si existe fecha limite y se incumple, si no tiene bookie, si no tiene picks, si los picks son incorrectos...
    checkBettingList(bettingList, date = null) {
        let details = this.calculateCombiDetails(bettingList);
        if(bettingList)
        {
            for (var i = 0; i < bettingList.length; i++) {

            var betDate = null;

            if (date != null) {
                betDate = new Date(details[bettingList[i].id].date);
            }
            if ((betDate != null && date.start && date.end && (date.start > betDate || date.end < betDate)) ||
                !bettingList[i].bookie || !bettingList[i].picks || bettingList[i].picks.length == 0 ||
                this._pickService.checkPicks(bettingList[i].picks) == 0) {
                bettingList.splice(i, 1);
                i--;
            }
        }
        }
        
        return bettingList;
    }

         //Revisamos una lista de apuestas, calculando los resultados y estadisticas segun el tipster
         getStatsFromBettingList(bettingList, key=null){
            //revisamos la lista de apuestas que nos llega
            //comprobamos los resultados/cuotas/fechas y agrupamos en funcion del tipster
            //devolvemos una lista con las estadisticas de cada tipster
            let tipsterList={};
            if (!bettingList)bettingList=[];
            for (var i=0; i<bettingList.length;i++){
    
                let user=bettingList[i].user;
                let numWins=0;
                let numFails=0;
                let numPicks=0;
                let stakedUnits=0;
                let wonUnits=0;
                let lostUnits=0;
    
                let oddAverage= Number(this.calculateOdd(bettingList[i]));
    
                //comprobamos si el usuario está completado...
                if(user.id){
                    switch (this.calculateResult(bettingList[i])) {
                        case 0:
                            oddAverage=0;
                            break;
                        case 1:
                            numWins++;
                            numPicks++;
                            stakedUnits+=bettingList[i].stake;
                            wonUnits+=bettingList[i].stake* Number(this.calculateOdd(bettingList[i])) - bettingList[i].stake;
                            break;
                        case 2:
                            numFails++;
                            numPicks++;
                            lostUnits+=bettingList[i].stake;
                            stakedUnits+=bettingList[i].stake;
                            break;
                        case 3:
                            numPicks++;
                            stakedUnits+=bettingList[i].stake;
                            break;
                        case 4:
                            numPicks++;
                            stakedUnits+=bettingList[i].stake;
                            wonUnits+=bettingList[i].stake*0.5* Number(this.calculateOdd(bettingList[i]))-bettingList[i].stake*0.5;
                            break;
                        case 5:
                            numPicks++;
                            stakedUnits+=bettingList[i].stake;
                            lostUnits+=bettingList[i].stake* 0.5;
                            break;
                    }
                    
                    if(!tipsterList[user.id]){
                        tipsterList[user.id] = {numPicks,numWins,numFails,stakedUnits,wonUnits,lostUnits,oddAverage,winsAverage:0,yield:0, user:user};
                    }else{
                        tipsterList[user.id]['numPicks']+=numPicks;
                        tipsterList[user.id]['numWins']+=numWins;
                        tipsterList[user.id]['numFails']+=numFails;
                        tipsterList[user.id]['stakedUnits']+=stakedUnits;
                        tipsterList[user.id]['wonUnits']+=wonUnits;
                        tipsterList[user.id]['lostUnits']+=lostUnits;
                        tipsterList[user.id]['oddAverage']+=oddAverage;
    
                    }
                }
            }
            var arrayTipster=[];
            
            for (var tipster in tipsterList){
                
                tipsterList[tipster].profit=Number(Number(tipsterList[tipster].wonUnits-tipsterList[tipster].lostUnits).toFixed(2));
                tipsterList[tipster].oddAverage=Number((tipsterList[tipster].oddAverage/tipsterList[tipster].numPicks).toFixed(2));
                tipsterList[tipster].stakeAverage=Number((tipsterList[tipster].stakedUnits/tipsterList[tipster].numPicks).toFixed(2));
                tipsterList[tipster].yield=Number((tipsterList[tipster].profit/Number(tipsterList[tipster].stakedUnits)*100).toFixed(1));
                tipsterList[tipster].winsAverage=Number((tipsterList[tipster].numWins/tipsterList[tipster].numPicks*100).toFixed(1));
    
    
                var numPicksFilter=0;
                var yieldFilter=null;
                var winsAverageFilter=0;
                var tipsterName="";
    
                if(key!=null){
                    if(key.numPicks)
                        numPicksFilter=key.numPicks;
                    if(key.yield)
                        yieldFilter=key.yield;
                    if(key.winsAverage)
                        winsAverageFilter=key.winsAverage;
                    if(key.tipster)
                        tipsterName=key.tipster;
                
                    
                }
                if( tipsterList[tipster].numPicks>=numPicksFilter && tipsterList[tipster].winsAverage>=winsAverageFilter &&
                    (yieldFilter==null||tipsterList[tipster].yield>=yieldFilter) && 
                    (tipsterName=="" || tipsterList[tipster].user.username.indexOf(tipsterName)>=0))
                        arrayTipster.push(tipsterList[tipster]);
    
                
            }
            return arrayTipster;
         }

         


         

    favBookiesList(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/bookies/' + id, { headers: headers }).map(res => res.json());

    }
    favCompetitionsList(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/competitions/' + id, { headers: headers }).map(res => res.json());
    }
    favSportsList(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/sports/' + id, { headers: headers }).map(res => res.json());
    }
    favCountriesList(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/countries/' + id, { headers: headers }).map(res => res.json());
    }

    activeMonthsList(id) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'bet/activeMonths/' + id, { headers: headers }).map(res => res.json());
    }

    determineBet(bet) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url + 'bet/result/', { bet: bet }, { headers: headers }).map(res => res.json());
    }


}