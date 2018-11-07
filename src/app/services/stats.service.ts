import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { UserService } from './user.service';
import { PickService } from './pick.service';
import { BetService } from './bet.service';

import { Stats } from '../models/stats';

declare var jQuery: any;
declare var $: any;

@Injectable() 
export class StatsService {
    public url: string;
    public token;
    public statsOfTipster: Stats;


    constructor(
        private _http: Http,
        private _userService: UserService,
        private _pickService: PickService,
        private _betService: BetService,
        //   private _subscriptionService: SubscriptionService
    ) {
        this.url = GLOBAL.url;
        this.token = this._userService.getToken();
        this.statsOfTipster = null;
    }


    //Revisamos una lista de apuestas, calculando los resultados y estadisticas segun el tipster
    getStatsFromBettingList(bettingList, key = null):Stats[] {
        //revisamos la lista de apuestas que nos llega
        //comprobamos los resultados/cuotas/fechas y agrupamos en funcion del tipster
        //devolvemos una lista con las estadisticas de cada tipster
        let tipsterList = {};

        for (var i = 0; i < bettingList.length; i++) {

            let user = bettingList[i].user;
            let numWins = 0;
            let numFails = 0;
            let numVoids=0;
            let numPicks = 0;
            let numPendings=0;
            let stakedUnits = 0;
            let wonUnits = 0;
            let lostUnits = 0;

            let oddAverage = Number(this._betService.calculateOdd(bettingList[i]));

            //comprobamos si el usuario está completado...
            if (user.id) {
                switch (this._betService.calculateResult(bettingList[i])) {
                    case 0:
                        oddAverage = 0;
                        numPendings++;
                        break;
                    case 1:
                        numWins++;
                        numPicks++;
                        stakedUnits += bettingList[i].stake;
                        wonUnits += bettingList[i].stake * Number(this._betService.calculateOdd(bettingList[i])) - bettingList[i].stake;
                        break;
                    case 2:
                        numFails++;
                        numPicks++;
                        lostUnits += bettingList[i].stake;
                        stakedUnits += bettingList[i].stake;
                        break;
                    case 3:
                        numPicks++;
                        numVoids++;
                        stakedUnits += bettingList[i].stake;
                        break;
                    case 4:
                        numPicks++;
                        numWins++;
                        stakedUnits += bettingList[i].stake;
                        wonUnits += bettingList[i].stake * 0.5 * Number(this._betService.calculateOdd(bettingList[i])) - bettingList[i].stake * 0.5;
                        break;
                    case 5:
                        numPicks++;
                        numFails++;
                        stakedUnits += bettingList[i].stake;
                        lostUnits += bettingList[i].stake * 0.5;
                        break;
                }

                if (!tipsterList[user.id]) {
                    tipsterList[user.id] = { numPicks, numWins, numFails, numVoids, numPendings, stakedUnits, wonUnits, lostUnits, oddAverage, winsAverage: 0, yield: 0, user: user };
                } else {
                    tipsterList[user.id]['numPicks'] += numPicks;
                    tipsterList[user.id]['numWins'] += numWins;
                    tipsterList[user.id]['numFails'] += numFails;
                    tipsterList[user.id]['numVoids'] += numVoids;
                    tipsterList[user.id]['numPendings'] += numPendings;
                    tipsterList[user.id]['stakedUnits'] += stakedUnits;
                    tipsterList[user.id]['wonUnits'] += wonUnits;
                    tipsterList[user.id]['lostUnits'] += lostUnits;
                    tipsterList[user.id]['oddAverage'] += oddAverage;

                }
            }
        }
        var arrayTipster:Array<Stats>=[];

        for (var tipster in tipsterList) {

            tipsterList[tipster].profit = Number(Number(tipsterList[tipster].wonUnits - tipsterList[tipster].lostUnits).toFixed(2));
            tipsterList[tipster].oddAverage = Number((tipsterList[tipster].oddAverage / tipsterList[tipster].numPicks).toFixed(2));
            tipsterList[tipster].stakeAverage = Number((tipsterList[tipster].stakedUnits / tipsterList[tipster].numPicks).toFixed(2));
            tipsterList[tipster].yield = Number((tipsterList[tipster].profit / Number(tipsterList[tipster].stakedUnits) * 100).toFixed(1));
            tipsterList[tipster].winsAverage = Number((tipsterList[tipster].numWins / tipsterList[tipster].numPicks * 100).toFixed(1));


            var numPicksFilter = 0;
            var yieldFilter = null;
            var winsAverageFilter = 0;
            var tipsterName = "";

            if (key != null) {
                if (key.numPicks)
                    numPicksFilter = key.numPicks;
                if (key.yield)
                    yieldFilter = key.yield;
                if (key.winsAverage)
                    winsAverageFilter = key.winsAverage;
                if (key.tipster)
                    tipsterName = key.tipster;


            }
            let t=tipsterList[tipster];
            
            let tipsterStats=new Stats(t.user,t.numPicks,t.numWins,t.numFails,t.numVoids,t.numPendings,0,
                t.stakedUnits,t.stakeAverage,t.wonUnits,t.lostUnits,t.profit,t.oddAverage,t.winsAverage,t.yield);
            if (tipsterList[tipster].numPicks >= numPicksFilter && tipsterList[tipster].winsAverage >= winsAverageFilter &&
                (yieldFilter == null || tipsterList[tipster].yield >= yieldFilter) &&
                (tipsterName == "" || tipsterList[tipster].user.username.indexOf(tipsterName) >= 0))
                arrayTipster.push(tipsterStats);


        }
        return arrayTipster;
    }





    originalStatsOfTipster(tipster, dates = null):Stats {
        
        let key = {
            "pick.result": { "is not": 0 },
            "bet.user_id": { "is": tipster.id }
        };
        let date = new Date();
        var f = null;
        var f2 = null;


        
        if(!dates||dates.startDate=="thismonth"){
            key = $.extend(key, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
            f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
            f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 0);
        }
        else if(dates.startDate=="all"){
            //EN este caso no hacemos nada...

        }else if (dates && dates.startDate && dates.endDate) {
            f=dates.startDate;
            f2=dates.endDate;
            let startCondition = dates.startDate.getFullYear() + "-" + (dates.startDate.getMonth() + 1) + "-" + 1;
            let endCondition = dates.endDate.getFullYear() + "-" + (dates.endDate.getMonth() + 1) + "-" + dates.endDate.getDate() + " 23:59:59";
            key = $.extend(key, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });
            
        }

        return this._betService.basicBettingSearch(key).then(
            bettingList => {
                return this._betService.checkBettingList(bettingList, {"start":f,"end":f2});
            }
        ).then(
            btList => {
                return this.getStatsFromBettingList(btList);
            }
        ).then(
            statsList => {
                if (!statsList[0]) {
                    return new Stats(tipster,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
                    // { numPicks: 0, numWins: 0, numFails: 0, stakedUnits: 0, wonUnits: 0.0, lostUnits: 0, oddAverage: 0, winsAverage: 0, yield: 0, user: tipster, profit: 0, stakeAverage: 0 }
                    //    this.originalTipsterList[tipsterNull.user.username] = tipsterNull;
                    //    this.originalYieldChart[tipsterNull.user.username] = this.crearChart("yield", 0);
                }
                else {
                    return statsList[0];
                }
            }
        ).catch(
            error => console.log(error)
        )
    }

}