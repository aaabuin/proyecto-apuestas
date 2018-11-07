import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { BetService } from '../services/bet.service';
import { User } from '../models/user';
import { Bet } from '../models/bet';

declare var jQuery: any;
declare var $: any;

@Component({
    selector: 'tipsters-list',
    templateUrl: '../views/tipsters-list.html',
    providers: [
        UserService,
        BetService
    ]
})

export class TipstersListComponent implements OnInit {
    public tipstersList: Array<any>;
    public bettingList: Array<Bet>;
    public success: string;
    public error: string;
    public url: string;
    public order: Array<string>;
    tipstersPerPage: number = 10;
    //    options: Object;

    winsChart = [];
    yieldChart = [];

    constructor(
        private _userService: UserService,
        private _betService: BetService
    ) {
        this.url = GLOBAL.url;
    }

    ngOnInit() {
        this.order = ["yield", "desc"];
        let date = new Date();
        let key = {
            "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() },
            "pick.result": { "is not": 0 }
        };
        this.search(key).then(
            () => {
                let f = new Date(Number(date.getFullYear()), date.getMonth(), 1, 0, 0, 0);
                let f2 = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
                this.bettingList = this._betService.checkBettingList(this.bettingList, { 'start': f, 'end': f2 });
                return
            }
        ).then(
            () => {
                this.tipstersList = this._betService.getStatsFromBettingList(this.bettingList);
                this.tipstersList.forEach(tipster => {
                    this.winsChart[tipster.user.username] = this.crearChart("wins", tipster.winsAverage);
                    this.yieldChart[tipster.user.username] = this.crearChart("yield", tipster.yield);
                });
                return
            }
        );




    }

    search(key) {
        return this._betService.basicBettingSearch(key).then(
            response => {
                this.bettingList = response;
                return 1;
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


    showMore(){
        this.tipstersPerPage+=10;
    }

    /** starDAte guarda la fecha con el mes y año iniciales con los que crearemos la clave de busqueda y filtraremos en checkbettingList()
     * today :guarda la fecha actual, que será siempre el final de la busqueda y checkeo
     * datefilter: almacena la fecha con el formato requerido para buscar en la bd
     */
    receiveFilters(event) {
        if (event.filter.order) {
            this.order[0] = event.filter.order;
        }

        var key = {};
        let startDate = new Date();
        let today = new Date();
        let dateFilter;

        //!event.filter.period ||
        if (event.filter.period && event.filter.period == "thismonth") {
            dateFilter = (today.getFullYear()) + "-" + (today.getMonth() + 1) + "-1 00:00:00";
            key = $.extend(key, { "event.date": { 'after date': dateFilter } });
        }
        if (event.filter.period && event.filter.period == "last3m") {
            startDate.setMonth(today.getMonth() - 2);
            dateFilter = (startDate.getFullYear()) + "-" + (startDate.getMonth() + 1) + "-1 00:00:00";
            key = $.extend(key, { "event.date": { 'after date': dateFilter } });
        }
        if (event.filter.period && event.filter.period == "last6m") {
            startDate.setMonth(today.getMonth() - 5);
            dateFilter = (startDate.getFullYear()) + "-" + (startDate.getMonth() + 1) + "-1 00:00:00";
            key = $.extend(key, { "event.date": { 'after date': dateFilter } });
        }

        //Si este caso Se repite pick result not 0 mas adelante aunque no influye
        //establecemos key para asegurarnos que mas adelante se ejecute la busqueda, pues si key es vacio no actualiza bettingList.
        //al establecer startDate a null, más adelante no se estableceran fechas de inicio y fin para checkBettingList()
        if (event.filter.period && event.filter.period == "all") {
            startDate = null;
            key = $.extend(key, { "pick.result": { "is not": 0 } });
        }


        if (event.filter.sport) {
            key = $.extend(key, { "sport.id": { "is": event.filter.sport } });
        }
        if (event.filter.country) {
            key = $.extend(key, { "country.id": { "is": event.filter.country } });
        }
        if (event.filter.competition) {
            key = $.extend(key, { "competition.id": { "is": event.filter.competition } });
        }


        if (jQuery.isEmptyObject(key)) {
            this.tipstersList = this._betService.getStatsFromBettingList(this.bettingList, event.filter);
            this.tipstersList.forEach(tipster => {

                this.winsChart[tipster.user.username] = this.crearChart("wins", tipster.winsAverage);
                this.yieldChart[tipster.user.username] = this.crearChart("yield", tipster.yield);
            });
        } else {

            key = $.extend(key, { "pick.result": { "is not": 0 } });
            this.search(key).then(
                () => {
                    let f;
                    let f2;
                    if (startDate) {
                        f = new Date(Number(startDate.getFullYear()), startDate.getMonth(), 1, 0, 0, 0);
                        f2 = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
                    }
                    this.bettingList = this._betService.checkBettingList(this.bettingList, { 'start': f, 'end': f2 });
                    return
                }
            ).then(
                () => {
                    this.tipstersList = this._betService.getStatsFromBettingList(this.bettingList, event.filter);
                    this.tipstersList.forEach(tipster => {
                        this.winsChart[tipster.user.username] = this.crearChart("wins", tipster.winsAverage);
                        this.yieldChart[tipster.user.username] = this.crearChart("yield", tipster.yield);
                    });
                    return
                }
            );
        }





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