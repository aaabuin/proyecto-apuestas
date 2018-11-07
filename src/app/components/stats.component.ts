import { Component, OnInit, Input } from '@angular/core';

import { Pick } from '../models/pick';
import { User } from '../models/user';
import { Bet } from '../models/bet';
import { Subscription } from '../models/subscription';

import { PickService } from '../services/pick.service';
import { BetService } from '../services/bet.service';
import { SubscriptionService } from '../services/subscription.service';
import { UserService } from '../services/user.service';

import { GLOBAL } from '../services/global';
import { Chart } from 'angular-highcharts';


declare var jQuery: any;
declare var $: any;


@Component({
    selector: 'stats',
    templateUrl: '../views/stats.html',
    providers: [
        UserService,
        PickService,
        BetService
    ]
})

export class StatsComponent implements OnInit {

    public identity;
    //public tipster:User;
    //public listaApuestas:Array<Apuesta>;

    public url: string;
    public loading: boolean;
    public error:string;

    public numPicks: number;
    public numPending: number;
    public numRejected: number;
    public numWins: number;
    public numFails: number;
    public numVoids: number;
    public stakedUnits: number;
    public wonUnits: number;
    public lostUnits: number;
    public oddAverage: number;
    public stakeAverage: number;
    public profit: number;

    public subscription: Subscription;
    public amount:number;

    public benefitsPercent: number;
    public winsPercent: number;

    winsChart: any;
    yieldChart: any;

    @Input() bettingList: Array<any>;
    @Input() tipster: User;
    //usamos el input alert para detectar cuando listaapuestas fue modificada en el componente padre
    //debido a que en algunos casos, el ngOnchanges no detecta bien si hubo algun cambio
    @Input() alert: boolean;
    //porcentaje acierto
    //yield

    //historial ultimos meses...

    constructor(
        private _userService: UserService,
        private _betService: BetService,
        private _subscriptionService: SubscriptionService
    ) {
        this.identity = this._userService.getIdentity();
        this.url = GLOBAL.url;
        this.loading = true;
        this.error=null;
        this.bettingList = [];
        this.subscription=new Subscription(null,null,null,null,null,null);

        this.numPicks = 0;
        this.numPending = 0;
        this.numRejected=0;
        this.numWins = 0;
        this.numFails = 0;
        this.numVoids = 0;
        this.stakedUnits = 0;
        this.wonUnits = 0;
        this.lostUnits = 0;
        this.oddAverage = 0;
        this.stakeAverage = 0;
        this.profit = 0;
        this.winsPercent = 0;
        this.benefitsPercent = 0;
        
    }

    ngOnInit() {
        this.winsChart = this.createChart("wins", 0);
        this.yieldChart = this.createChart("yield", 0);
    }


    ngOnChanges() {

        if (this.bettingList.length > 0) {

            this.loading = false;

            this.stakedUnits = 0;
            this.wonUnits = 0;
            this.lostUnits = 0;
            this.profit = 0;

            this.numWins = 0;
            this.numPicks = 0;
            this.numPending = 0;
            this.numRejected=0;
            this.numFails = 0;
            this.numVoids = 0;


            for (var i = 0; i < this.bettingList.length; i++) {
                let stake =0;
                if (this.bettingList[i].stake){
                    stake=this.bettingList[i].stake;
                }else if(this.bettingList[i].amount){
                    stake=this.bettingList[i].amount;
                }

                switch (this._betService.calculateResult(this.bettingList[i])) {
                    case 0:
                    case 11:
                        this.numPending++;
                        break;
                    case 1:
                    case 6:
                        this.oddAverage += Number(this._betService.calculateOdd(this.bettingList[i]));
                        this.numWins++;
                        this.numPicks++;
                        this.stakedUnits += stake;
                        this.wonUnits +=stake * Number(this._betService.calculateOdd(this.bettingList[i])) - stake;
                        break;
                    case 2:
                    case 7:
                        this.numFails++;
                        this.numPicks++;
                        this.lostUnits += stake;
                        this.stakedUnits += stake;
                        this.oddAverage += Number(this._betService.calculateOdd(this.bettingList[i]));
                        break;
                    case 3:
                    case 8:
                        this.numVoids++;
                        //this.numPicks++;
                        //this.stakedUnits += stake;
                        //this.oddAverage += Number(this._betService.calculateOdd(this.bettingList[i]));
                        break;
                    case 4:
                    case 9:
                        //this.numVoids++;
                        this.numPicks++;
                        this.numWins++;
                        this.oddAverage += Number(this._betService.calculateOdd(this.bettingList[i]));
                        this.stakedUnits +=stake;
                        this.wonUnits += stake * 0.5 * Number(this._betService.calculateOdd(this.bettingList[i])) - stake * 0.5;
                        break;
                    case 5:
                    case 10:
                        this.numFails++;
                        this.stakedUnits +=  stake;
                        this.lostUnits +=  stake * 0.5;
                        this.oddAverage += Number(this._betService.calculateOdd(this.bettingList[i]));
                        break;
                    case 12:
                        //contar numRejected?
                        this.numRejected++;
                        break;
                }
            }

            if(this.numPicks>0){
                this.oddAverage = Number((this.oddAverage / this.numPicks).toFixed(2));
                this.stakeAverage = Number((this.stakedUnits / this.numPicks).toFixed(2));
                this.winsPercent = Number((this.numWins * 100 / this.numPicks).toFixed(1));
            }else{
                this.oddAverage = 0;
                this.stakeAverage = 0;
                this.winsPercent = 0;
            }

            this.profit = this.wonUnits - this.lostUnits;
            if(this.stakedUnits>0){
                this.benefitsPercent = Number((this.profit / this.stakedUnits * 100).toFixed(1));
            }else{
                this.benefitsPercent = 0;
            }

            this.profit = Number((this.wonUnits - this.lostUnits).toFixed(2));
            this.stakedUnits = Number((this.stakedUnits).toFixed(2));
            this.wonUnits = Number((this.wonUnits).toFixed(2));
            this.lostUnits = Number((this.lostUnits).toFixed(2));

            this.winsChart = this.createChart("wins", this.winsPercent);
            this.yieldChart = this.createChart("yield", this.benefitsPercent);

        }

        if (this.tipster && this.identity && this.tipster.id && this.tipster.id!=this.identity.id) {
            let key = {
                followerId: this.identity.id,
                tipsterId: this.tipster.id
            }
            
            this._subscriptionService.getSubscription(key).subscribe(
                response => {
                    this.subscription=response;
                },
                error => {
                   this.subscription=new Subscription(null,null,null,null,null,null);
                }
            );
        }
    }

    addFollow() {
        this.subscription.followerId=this.identity.id;
        this.subscription.tipsterId= this.tipster.id;
        this.subscription.amount=this.amount;

        this._subscriptionService.add(this.subscription).subscribe(
            response => {
                if(response!=0){
                    this._subscriptionService.getById(response).subscribe(
                        res=>{
                            this.subscription=res;
                        },
                        error=>{
                            this.subscription=null;
                        }
                    );
                }
            },
            error => {
               this.error="Subscription could not be added";
            }
        );
    }

    unfollow(){
        if(this.subscription){
            this._subscriptionService.stop(this.subscription).subscribe(
                response=>{
                    this.subscription=new Subscription(null,null,null,null,null,null);
                },
                error=>{
                    this.error= JSON.parse(error._body).message;
                    setTimeout(() => {
                        this.error=null;
                    },3000);
                }
            )
        }
    }

    createChart(modo, value = null) {
        let color = "";
        let label = "";
        let sign="";
        if (modo == "wins") {
            color = "#0083ff";
            label = "% acierto";
        }
        else if (modo == "yield") {
            label = "yield";
            if (value >= 0) {
                color = "#008000";
            } else {
                color = "red"
                value = value * (-1);
                sign="-";
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
                    y: 60,
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
                        format: '<div style="text-align:center"><span style="font-weight: bold;color:black;" >'+sign+'{y}</span></div>'
                    }
                },
                
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