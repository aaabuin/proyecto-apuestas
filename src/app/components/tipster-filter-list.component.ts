import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { BetService } from '../services/bet.service';
import { StatsService } from '../services/stats.service'
import { User } from '../models/user';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionBet } from '../models/subscriptionBet';
import { Stats } from '../models/stats';
import { Jsonp } from '@angular/http';

declare var jQuery: any;
declare var $: any;

@Component({
    selector: 'tipster-filter-list',
    templateUrl: '../views/tipster-filter-list.html',
    providers: [
        UserService,
        BetService,
        SubscriptionService,
        StatsService
    ]
})

export class TipsterFilterListComponent implements OnInit {
    public tipstersList: Array<any>;
    public tipsterSelected: User;

    public url: string;
    public identity;
    //    options: Object;

    winsChart = [];
    yieldChart = [];


    @Input() paramsSearch: any;
    @Output() tipster_filter = new EventEmitter();

    constructor(
        private _userService: UserService,
        private _subscriptionService: SubscriptionService,
        private _betService: BetService,
        private _statsService:StatsService
    ) {
        this.url = GLOBAL.url;
        this.tipstersList = [];
    }

    ngOnInit() {
        this.identity = this._userService.getIdentity();

    }

    ngOnChanges() {

        // recibimos paramsSearch de componente con startDate y endDate...
        //generamos la clave para buscar por fecha
        //añadimos clave para buscar por subscription
        //obtenemos tipsters
        //recorremos tipsters
        //obtenemos sus stats en funcion de la fecha...
        //mostramos lista de tipsters y yield
        let key = {}
        let date = new Date();
        var f = null;
        var f2 = null;
        if (!this.identity){
            this.identity = this._userService.getIdentity();
        }
            

        if (this.paramsSearch.startDate) {
           if (this.paramsSearch.startDate == "thismonth") {
                key = $.extend(key, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
            }else if (this.paramsSearch.startDate == "all") {
                key = $.extend(key, { "event.date": null });
            }  
            else {

                f = new Date(this.paramsSearch.startDate.getFullYear(), this.paramsSearch.startDate.getMonth(), 1, 0, 0, 0, 0);
                if (!this.paramsSearch.endDate) {
                    key = $.extend(key, { "event.date": { "month": (this.paramsSearch.startDate.getMonth() + 1), "year": this.paramsSearch.startDate.getFullYear() } });
                    f2 = new Date(this.paramsSearch.startDate.getFullYear(), this.paramsSearch.startDate.getMonth() + 1, 0, 23, 59, 59, 0);
                } else {
                    f2 = new Date(this.paramsSearch.endDate.getFullYear(), this.paramsSearch.endDate.getMonth() + 1, 0, 23, 59, 59, 0);
                    let startCondition = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + 1;
                    let endCondition = f2.getFullYear() + "-" + (f2.getMonth() + 1) + "-" + f2.getDate() + " 23:59:59";
                    key = $.extend(key, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });
                }
            }
        }
        else{

            key = $.extend(key, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
        }

        
        key = $.extend(key, {"subscription_bet.user_id": { "is": this.identity.id }});
        this._subscriptionService.getTipstersOfFollower(key).toPromise(
            ).then((r)=>{
                return Promise.all(r.map(
                    user => {
                        return this._statsService.originalStatsOfTipster(user, this.paramsSearch)
                    }))
               
            }).then(
                res=>{
                    this.tipstersList=res;
                    this.tipstersList.forEach(stats => {
                        console.log("CONA2."+JSON.stringify(stats));
                        this.yieldChart[stats.user.username]= this.crearChart("yield", stats.yieldPercent);
                        
                    });
                }
            )
    }

    assignTipster(tipster) {
        this.tipsterSelected = tipster;
        this.tipster_filter.emit({ tipster });
    }

    removeTipster() {
        this.tipsterSelected = null;
        this.tipster_filter.emit({});
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
                type: 'solidgauge',
                backgroundColor:"transparent",
                width:80
            },
            title: null,
            pane: {
                center: ['50%', '40'],
                size: '100%',
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
                    y: 40,
                    text: label
                },
                labels: {
                    y: 14
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
                        format: '<div style="text-align:center"><span style="font-size:13px!important;font-weight: bold;color:black;" >' + sign + '{y}</span></div>'
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