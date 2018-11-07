import {Component, OnInit} from '@angular/core';
import { Chart } from 'angular-highcharts';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { BetService } from '../services/bet.service';
import { User } from '../models/user';
import { Bet } from '../models/bet';

declare var jQuery:any;
declare var $:any;

@Component({
    selector: 'my-tipsters',
    templateUrl: '../views/my-tipsters.html',
    providers: [
        UserService,
        BetService
        ]
})

export class MyTipstersComponent implements OnInit{
  ngOnInit(){}
  /*
    public tipstersList:Array<any>;
    public bettingList:Array<Bet>;
    public success:string;
    public error:string;
    public url:string;


    winsChart=[];
    yieldChart=[];

    constructor(
        private _userService: UserService,
        private _betService: BetService
    ) {
        this.url= GLOBAL.url; 
    }
 
    ngOnInit(){
        let date=new Date();
        let key={
            "event.date":{"month":(date.getMonth()+1) , "year":date.getFullYear() },
            "pick.result":{"is not":0}
        } 

        this._betService.basicBettingSearch(key).then(
            response=>{
                this.bettingList=response;
               // this.listaApuestas=this._apuestaService.checkBettingList(this.listaApuestas);
                this.tipstersList = this.getStatsFromBettingList(this.bettingList);

                this.tipstersList.forEach(tipster => {
                    let percent=Number((tipster.numWins/tipster.numPicks*100).toFixed(1));
                    this.winsChart[tipster.user.username]=this.crearChart("wins", percent);
                    this.yieldChart[tipster.user.username]=this.crearChart("yield",tipster.yield);
                });
            },
            error=>{
                this.error=JSON.parse(error._body).message;
                this.success= null;   
                setTimeout(() => {
                    this.error=null;
                }, 3000);
            }
        );
     }
    
     //Revisamos una lista de apuestas, calculando los resultados y estadisticas segun el tipster
     getStatsFromBettingList(bettingList){
        //revisamos la lista de apuestas que nos llega
        //comprobamos los resultados/cuotas/fechas y agrupamos en funcion del tipster
        //devolvemos una lista con las estadisticas de cada tipster
        let tipsterList={};

        for (var i=0; i<bettingList.length;i++){

            let user=bettingList[i].user;
            let numWins=0;
            let numFails=0;
            let numPicks=0;
            let stakedUnits=0;
            let wonUnits=0;
            let lostUnits=0;

            let oddAverage= Number(this._betService.calculateOdd(this.bettingList[i]));

            //comprobamos si el usuario está completado...
            if(user.id){
                switch (this._betService.calculateResult(this.bettingList[i])) {
                    case 0:
                        oddAverage=0;
                        break;
                    case 1:
                        numWins++;
                        numPicks++;
                        stakedUnits+=this.bettingList[i].stake;
                        wonUnits+=this.bettingList[i].stake* Number(this._betService.calculateOdd(this.bettingList[i])) - this.bettingList[i].stake;
                        break;
                    case 2:
                        numFails++;
                        numPicks++;
                        lostUnits+=this.bettingList[i].stake;
                        stakedUnits+=this.bettingList[i].stake;
                        break;
                    case 3:
                        numPicks++;
                        stakedUnits+=this.bettingList[i].stake;
                        break;
                    case 4:
                        numPicks++;
                        stakedUnits+=this.bettingList[i].stake;
                        wonUnits+=this.bettingList[i].stake*0.5* Number(this._betService.calculateOdd(this.bettingList[i]))-this.bettingList[i].stake*0.5;
                        break;
                    case 5:
                        numPicks++;
                        stakedUnits+=this.bettingList[i].stake;
                        lostUnits+=this.bettingList[i].stake* 0.5;
                        break;
                }
                
                if(!tipsterList[user.id]){
                    tipsterList[user.id] = {numPicks,numWins,numFails,stakedUnits,wonUnits,lostUnits,oddAverage,yield:0, user:user};
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
            tipsterList[tipster].yield=Number((tipsterList[tipster].profit/Number(tipsterList[tipster].wonUnits)*100).toFixed(1));

            arrayTipster.push(tipsterList[tipster]);
        }

        return arrayTipster;
     }

     crearChart(modo, value=null){

        let color="";
        let label="";
        if(modo=="wins"){
            color="#0083ff";
            label="% acierto";
        }
        else if(modo=="yield"){
            label="yield";
            if(value>=0){
                color="#008000";
            }else{
                color="red"
                value=value*(-1);
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
                stops:[[0,color]],
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
                        useHTML: true
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



    */ 
      }