import {Component, OnInit} from '@angular/core';

import { Pick } from '../models/pick';
import { User } from '../models/user';
import { Bet } from '../models/bet';

import { BetService } from '../services/bet.service';


import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';

declare var jQuery:any;
declare var $:any;


@Component({
    selector: 'personal-page',
    templateUrl: '../views/personal-page.html',
    providers: [
        UserService,
        BetService
        ]
}) 

export class PersonalPageComponent implements OnInit{
    public user: User;
    public identity;

    public success:string;
    public error:string;

    public bettingList:Array<Bet>;
    public changeAlert: boolean;
    public details;
    public settledBet:Bet;

    public url:string;
    //public pick:Pick;
    public loading:boolean;

    constructor(
        private _userService: UserService,
        public _betService:BetService
    ){
        this.identity = this._userService.getIdentity();
        this.user=new User(null,"","","","","",null);
        this.url= GLOBAL.url;
        this.loading=true;
        this.changeAlert=false;
        this.bettingList=[];
        this.details={};

    }
        
    ngOnInit(){
        this._userService.getMyUser().subscribe(
            response=>{
                this.user=response;
                let date = new Date();
                let key={
                    "bet.user_id":{'is':this.user.id},
                    "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() }
                  
                };
        
                this._betService.advancedBettingSearch(key).then(
        
                    response=>{
                        this.bettingList=response;

                        //Establecemos este mes en el rango de fechas para filtrar en checkbettinglist
                        let f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
                        let f2=new Date(date.getFullYear(),date.getMonth()+1,0,23,59,59,0);
                        this.bettingList=this._betService.checkBettingList(this.bettingList, { 'start': f, 'end': f2 });
                        this.details=this._betService.calculateCombiDetails(response);
                        this.loading=false;
                    },
                    error=>{
                        this.error=JSON.parse(error._body).message;
                        this.success= null;   
                        setTimeout(() => {
                            this.error=null;
                        }, 3000);
                    }
                );
 
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

     showCombi(id){
        $( "ul#combinada"+id ).toggle(200);
     }

   


     receiveData(event){
        //let pos = this.listaApuestas.indexOf(this.listaApuestas.find(o => o.id === event.apuestaResuelta.id));
        //this.listaApuestas[pos]=event.apuestaResuelta;
        this.changeAlert=!this.changeAlert;
        this.details=this._betService.calculateCombiDetails(this.bettingList);
    }   
            
    receiveFilters(event){
        this.search(event.filter);
    }

    search(params) {
        let type;
        let result = {};
        if (params.type == "simple") {

        }
        if (params.type == "combi") {

        }
        if (params.type == "live") {

        }

        if (params.status == "00") {
            result = { "is": 0 };
        }
        if (params.status == 1) {
            result = { "is not": 0 };
        }

        let search = {
            "bet.user_id": { "is": this.identity.id },
            "competition.name": { "is": params.competition },
            "country.id": { "is": params.country },
            "sport.id": { "is": params.sport },
            "bet.bookie_id": { "is": params.bookie },
            "pick.result": result,
            "pick.pick": { "contains": params.pick }
        }


        let date = new Date();
        var f = null;
        var f2 = null;

        //completamos search especificando las fechas de los eventos a buscar
        //por otra parte, establecemos f y f2, que nos servirán para revisar la lista de apuestas devueltas
        //y eliminar las posibles combinadas que no se resuelvan en ese rango de fechas.
        
        if (params.startDate == "thismonth") {
            search = $.extend(search, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
            f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
            f2=new Date(date.getFullYear(),date.getMonth()+1,0,23,59,59,0);
        }
        else if (params.startDate == "all") {
            search = $.extend(search, { "event.date": null });
        }
        else {
            f = new Date(params.startDate.getFullYear(), params.startDate.getMonth(), 1, 0, 0, 0, 0);

            if (!params.endDate) {
                search = $.extend(search, { "event.date": { "month": (params.startDate.getMonth() + 1), "year": params.startDate.getFullYear() } });
                f2 = new Date(params.startDate.getFullYear(), params.startDate.getMonth() + 1, 0, 23, 59, 59, 0);
            } else {
                f2 = new Date(params.endDate.getFullYear(),params.endDate.getMonth()+1,0,23,59,59,0);

                let startCondition = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + 1;
                let endCondition = f2.getFullYear() + "-" + (f2.getMonth() + 1) + "-" + f2.getDate()+ " 23:59:59";
                
                search = $.extend(search, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });
            }
        }
        this.loading = true;
        this._betService.advancedBettingSearch(search).then(
            response => {
                // this.bettingList=response;
                if (params.startDate != null && params.startDate != "all") {
                    this.bettingList = this._betService.checkBettingList(response, { 'start': f, 'end': f2 });
                } else {
                    this.bettingList = this._betService.checkBettingList(response);
                }

                this.details = this._betService.calculateCombiDetails(response);
                this.loading = false;
            }
            , error => {
                this.error = JSON.parse(error._body).message;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            }
        )
    }
}
