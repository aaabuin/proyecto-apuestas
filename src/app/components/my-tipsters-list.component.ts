import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { BetService } from '../services/bet.service';
import { SubscriptionBetService } from '../services/subscriptionBet.service';
import { SubscriptionService } from '../services/subscription.service'
import { User } from '../models/user';
import { Bet } from '../models/bet';
import { SubscriptionBet } from '../models/subscriptionBet';
import { Subscription } from '../models/subscription';

declare var jQuery: any;
declare var $: any;

@Component({
    selector: 'my-tipsters-list',
    templateUrl: '../views/my-tipsters-list.html',
    providers: [
        UserService,
        BetService,
        SubscriptionBetService,
        SubscriptionService
    ]
})

export class MyTipstersListComponent implements OnInit {
    public tipstersList: Array<any>;
    public originalTipsterList: Array<any>;

    public success: string;
    public error: string;
    public url: string;
    public order: Array<string>;
    public identity: User;
    public subscriptionsList: Array<Subscription>;
    public subscriptionBettingList: Array<SubscriptionBet>;
    public startDate;
    public endDate;
    public startPeriod;
    public endPeriod;

    winsChart = [];
    yieldChart = [];
    originalYieldChart = [];

    constructor(
        private _userService: UserService,
        private _betService: BetService,
        private _subscriptionBetService: SubscriptionBetService,
        private _subscriptionService: SubscriptionService
    ) {
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.subscriptionBettingList = [];
        this.originalTipsterList = [];
    }

    ngOnInit() {
        this._subscriptionService.getSubscriptionByFollower(this.identity.id).subscribe(
            response => {
                this.subscriptionsList = response;
            }, error => console.log(error)
        )

        let date = new Date();
        this.order = ["yield", "desc"];
        let search = {
            "subscription_bet.user_id": { 'is': this.identity.id },
            "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() }
        };

        this.advancedSearch(search);


        let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        this._subscriptionBetService.activeMonthsList(this.identity.id).subscribe(
            r => {
                this.startPeriod = [];
                r.forEach(date => {
                    let d = new Date(date.date);
                    this.startPeriod.push({ value: d, name: months[d.getMonth()] + " " + d.getFullYear() });
                });

            }
        );


    }

    advancedSearch(search, date = null) {
        let f;
        let f2;
        if (date) {
            f = date.f;
            f2 = date.f2;
        } else {
            date = new Date();
            f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
            f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        }
        //CARGAR EL CORRESPONDIENTE valor en F Y F2 PARA 
        // - START Y END


        this.search(search).then(
            () => {
                return this.subscriptionBettingList = this._subscriptionBetService.checkBettingList(this.subscriptionBettingList, { 'start': f, 'end': f2 });
            }
        ).then(
            () => {
                return this._subscriptionBetService.loadOriginalBettingList(this.subscriptionBettingList)

            }
        ).then(
            () => {
                return this.tipstersList = this.getStatsFromBettingList(this.subscriptionBettingList);
            }
        ).then(
            () => {
                //COMPLETAMOS LA LISTA DE TIPSTERS CON LOS QUE ESTAN UNICAMENTE EN SUBSCRIPTIONS
                //LAS ESTADISTICAS SERAN CERO, CREAMOS LOS GRAFICOS DE WINS Y YIELD
                return Promise.all(this.subscriptionsList.map(subscription => {


                    if (!this.tipstersList.find(t => t.user.id == subscription.tipsterId)) {
                        return this._userService.getUserById(subscription.tipsterId).toPromise().then(
                            response => {
                                this.tipstersList.push({
                                    numPicks: 0, numWins: 0, numFails: 0, numPendings: 0, numRejected: 0, stakedUnits: 0, wonUnits: 0, lostUnits: 0,
                                    oddAverage: 0, winsAverage: 0, yield: 0, profit: 0, stakeAverage: 0, user: response, subscription: subscription.amount
                                })
                                this.winsChart[response.username] = this.crearChart("wins", 0);
                                this.yieldChart[response.username] = this.crearChart("yield", 0);
                                return Promise.resolve();
                            }
                        )
                    }
                    else {
                        let aux = this.tipstersList.find(t => t.user.id == subscription.tipsterId);
                        aux = $.extend(aux, { subscription: subscription.amount });
                        return Promise.resolve();
                    }
                }))
            }
        ).then(
            () => {
                return Promise.all(this.tipstersList.map(
                    tipster => {
                        return this.originalStatsOfTipster(tipster.user, { startDate: f, endDate: f2 });
                    }
                )).then(
                    response => {
                        return response;
                    }
                )
            }
        )
    }
    originalStatsOfTipster(tipster, dates = null) {

        let key = {
            "pick.result": { "is not": 0 },
            "bet.user_id": { "is": tipster.id }
        };
        var keyCheckDates = {};
        if (dates && dates.startDate && dates.endDate) {
            let startCondition = dates.startDate.getFullYear() + "-" + (dates.startDate.getMonth() + 1) + "-" + 1;
            let endCondition = dates.endDate.getFullYear() + "-" + (dates.endDate.getMonth() + 1) + "-" + dates.endDate.getDate() + " 23:59:59";
            key = $.extend(key, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });
            keyCheckDates = { "start": dates.startDate, "end": dates.endDate };
        }
        return this._betService.basicBettingSearch(key).then(
            bettingList => {
                return this._betService.checkBettingList(bettingList, keyCheckDates);
            }
        ).then(
            btList => {
                return this._betService.getStatsFromBettingList(btList);
            }
        ).then(
            statsList => {
                if (!statsList[0]) {
                    let tipsterNull = { numPicks: 0, numWins: 0, numFails: 0, stakedUnits: 0, wonUnits: 0.0, lostUnits: 0, oddAverage: 0, winsAverage: 0, yield: 0, user: tipster, profit: 0, stakeAverage: 0 }
                    this.originalTipsterList[tipsterNull.user.username] = tipsterNull;
                    this.originalYieldChart[tipsterNull.user.username] = this.crearChart("yield", 0);
                }
                else {
                    this.originalTipsterList[statsList[0].user.username] = statsList[0];
                    this.originalYieldChart[statsList[0].user.username] = this.crearChart("yield", statsList[0].yield);
                }
                return this.originalTipsterList;
            }
        ).catch(
            error => console.log(error)
        )
    }


    search(key) {
        return this._subscriptionBetService.advancedBettingSearch(key).then(
            response => {
                return this.subscriptionBettingList = response;

            },
            error => {
                this.error = JSON.parse(error._body).message;
                this.success = null;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            }
        );


    }

    //Revisamos una lista de apuestas, calculando los resultados y estadisticas segun el tipster
    getStatsFromBettingList(subscriptionBettingList, key = null) {
        //revisamos la lista de apuestas que nos llega
        //comprobamos los resultados/cuotas/fechas y agrupamos en funcion del tipster
        //devolvemos una lista con las estadisticas de cada tipster
        let tipsterList = {};

        for (var i = 0; i < subscriptionBettingList.length; i++) {

            let user = subscriptionBettingList[i].bet.user;
            let numWins = 0;
            let numFails = 0;
            let numPicks = 0;
            let stakedUnits = 0;
            let wonUnits = 0;
            let lostUnits = 0;
            let numRejected = 0;
            let numPendings = 0;

            let oddAverage = Number(this._betService.calculateOdd(this.subscriptionBettingList[i]));

            //comprobamos si el usuario está completado...
            if (user.id) {
                switch (this._subscriptionBetService.calculateResult(this.subscriptionBettingList[i])) {
                    case 0:
                    case 11:
                        oddAverage = 0;
                        numPendings++;
                        break;
                    case 1:
                    case 6:
                        numWins++;
                        numPicks++;
                        stakedUnits += this.subscriptionBettingList[i].amount;
                        wonUnits += this.subscriptionBettingList[i].amount * Number(this._betService.calculateOdd(this.subscriptionBettingList[i])) - this.subscriptionBettingList[i].amount;
                        break;
                    case 2:
                    case 7:
                        numFails++;
                        numPicks++;
                        lostUnits += this.subscriptionBettingList[i].amount;
                        stakedUnits += this.subscriptionBettingList[i].amount;
                        break;
                    case 3:
                    case 8:
                        numPicks++;
                        stakedUnits += this.subscriptionBettingList[i].amount;
                        break;
                    case 4:
                    case 9:
                        numPicks++;
                        stakedUnits += this.subscriptionBettingList[i].amount;
                        wonUnits += this.subscriptionBettingList[i].amount * 0.5 * Number(this._betService.calculateOdd(this.subscriptionBettingList[i])) - this.subscriptionBettingList[i].amount * 0.5;
                        break;
                    case 5:
                    case 10:
                        numPicks++;
                        stakedUnits += this.subscriptionBettingList[i].amount;
                        lostUnits += this.subscriptionBettingList[i].amount * 0.5;
                        break;
                    case 12:
                        numRejected++;
                }

                if (!tipsterList[user.id]) {
                    tipsterList[user.id] = { numPicks, numWins, numFails, numPendings, numRejected, stakedUnits, wonUnits, lostUnits, oddAverage, winsAverage: 0, yield: 0, user: user };
                } else {
                    tipsterList[user.id]['numPicks'] += numPicks;
                    tipsterList[user.id]['numWins'] += numWins;
                    tipsterList[user.id]['numFails'] += numFails;
                    tipsterList[user.id]['numPendings'] += numPendings;
                    tipsterList[user.id]['numRejected'] += numRejected;
                    tipsterList[user.id]['stakedUnits'] += stakedUnits;
                    tipsterList[user.id]['wonUnits'] += wonUnits;
                    tipsterList[user.id]['lostUnits'] += lostUnits;
                    tipsterList[user.id]['oddAverage'] += oddAverage;

                }
            }
        }
        var arrayTipster = [];

        for (var tipster in tipsterList) {

            tipsterList[tipster].profit = Number(Number(tipsterList[tipster].wonUnits - tipsterList[tipster].lostUnits).toFixed(2));
            tipsterList[tipster].oddAverage = Number((tipsterList[tipster].oddAverage / tipsterList[tipster].numPicks).toFixed(2));
            tipsterList[tipster].stakeAverage = Number((tipsterList[tipster].stakedUnits / tipsterList[tipster].numPicks).toFixed(2));
            tipsterList[tipster].yield = Number((tipsterList[tipster].profit / Number(tipsterList[tipster].stakedUnits) * 100).toFixed(1));
            tipsterList[tipster].winsAverage = Number((tipsterList[tipster].numWins / tipsterList[tipster].numPicks * 100).toFixed(1));


            var numPicksFilter = 0;
            var yieldFilter = null;
            var winsAverageFilter = null;
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


            if (!tipsterList[tipster].stakeAverage){
                tipsterList[tipster].stakeAverage=0;
            } 
            if (!tipsterList[tipster].yield ){
                tipsterList[tipster].yield=0
            }
            if (!tipsterList[tipster].winsAverage){
                tipsterList[tipster].winsAverage=0;
            }
            if (!tipsterList[tipster].oddAverage){
                tipsterList[tipster].oddAverage=0;
            }


            if (tipsterList[tipster].numPicks >= numPicksFilter &&
                (winsAverageFilter == null || tipsterList[tipster].winsAverage >= winsAverageFilter) &&
                (yieldFilter == null || tipsterList[tipster].yield >= yieldFilter) &&
                (tipsterName == "" || tipsterList[tipster].user.username.indexOf(tipsterName) >= 0)) {
                arrayTipster.push(tipsterList[tipster]);
            }




        }

        arrayTipster.forEach(tipster => {

            this.winsChart[tipster.user.username] = this.crearChart("wins", tipster.winsAverage);
            this.yieldChart[tipster.user.username] = this.crearChart("yield", tipster.yield);
        });
        return arrayTipster;
    }


    loadDates() {
        this.endPeriod = [];
        var f = null;
        var f2 = null;

        //Actualizamos los posibles valores de endPeriod segun el valor de startDate
        if (this.startDate != "thismonth" && this.startDate != "all") {
            let i = this.startPeriod.findIndex(o => o.name === this.startDate);
            this.endPeriod = this.startPeriod.slice(0, i);
            if (this.endPeriod.findIndex(o => o.name === this.endDate) < 0)
                this.endDate = "startdate";
        }


        let search = { "subscription_bet.user_id": { "is": this.identity.id }, };
        let date = new Date();

        if (!this.startDate || this.startDate == "thismonth") {
            this.endDate = "startdate";
            search = $.extend(search, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
            f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
            f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 0);
        }
        else if (this.startDate == "all") {

        }
        else {
            if (!this.endDate || this.endDate == "startdate") {
                let sD = this.startPeriod.find(o => o.name === this.startDate);
                search = $.extend(search, { "event.date": { "month": (sD.value.getMonth() + 1), "year": sD.value.getFullYear() } });
                f = new Date(sD.value.getFullYear(), sD.value.getMonth(), 1, 0, 0, 0, 0);
                f2 = new Date(sD.value.getFullYear(), sD.value.getMonth() + 1, 0, 23, 59, 59, 0);
            } else {
                let sD = this.startPeriod.find(o => o.name === this.startDate);
                let eD = this.endPeriod.find(o => o.name === this.endDate);
                f2 = new Date(eD.value.getFullYear(), eD.value.getMonth() + 1, 0, 23, 59, 59, 0);
                f = new Date(sD.value.getFullYear(), sD.value.getMonth(), 1, 0, 0, 0, 0);
                let startCondition = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + 1;
                let endCondition = f2.getFullYear() + "-" + (f2.getMonth() + 1) + "-" + f2.getDate() + " 23:59:59";
                search = $.extend(search, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });

            }
        }

        this.advancedSearch(search, { f, f2 });
    }



    crearChart(mode, value = null) {

        let color = "";
        let label = "";
        let sign = "";

        if (mode == "wins") {
            color = "#0083ff";
            label = "% acierto";
        }
        else if (mode == "yield") {
            label = "yield";
            if (value >= 0) {
                color = "#008000";
            } else {
                color = "red"
                value = value * (-1);
                sign = "-";
            }
        }

        return new Chart({
            chart: {
                type: 'solidgauge'
            },
            title: null,
            pane: {
                center: ['50%', '70'],
                size: '90%',
                startAngle: -120,
                endAngle: 120,
                background: {
                    backgroundColor: '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            tooltip: {
                enabled: false
            },
            // the value axis
            yAxis: {
                stops: [[0, color]],
                lineWidth: 1,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: 65,
                    text: label
                },
                labels: {
                    y: 16
                },
                min: 0,
                max: 100
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: -35,
                        borderWidth: 0,
                        useHTML: true,
                        format: '<div style="text-align:center"><span style="font-weight: bold;color:black;" >' + sign + '{y}</span></div>'
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                data: [value]
            }]
        });
    }

}