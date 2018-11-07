import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';


import { Pick } from '../models/pick';
import { User } from '../models/user';
import { SubscriptionBet } from '../models/subscriptionBet';
import { Bookie } from '../models/bookie';
import { Bet } from '../models/bet';

import { SubscriptionPickService } from '../services/subscriptionPick.service';
import { SubscriptionBetService } from '../services/subscriptionBet.service';
import { BookieService} from '../services/bookie.service';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { BookiesComponent } from '../admin/components/bookies.component';
import { Jsonp } from '@angular/http';

declare var jQuery:any;
declare var $:any;


@Component({
    selector: 'subscriptions-page',
    templateUrl: '../views/subscriptions-page.html',
    providers: [
        UserService,
        SubscriptionPickService,
        SubscriptionBetService,
        BookieService
        ]
}) 

export class SubscriptionsPageComponent implements OnInit{
    //public tipster: User;
    public identity;
    public error;
    public bookiesList:Array<Bookie>;
    public subscriptionBettingList:Array<SubscriptionBet>;
    public changeAlert: boolean;
    public details;

    public paramsSearch;
    public tipsterSearch:Number;

   // public settleBet:Bet;
    public subscriptionBet:SubscriptionBet;
    public bookieSelected: number;
    public modifiedPickId:number;
    public modifiedOddId:number;
    public modifiedAmountId:number;
    public url:string;
    public loading:boolean;

    constructor(
        private _userService: UserService,
        private _route: ActivatedRoute,
        public _subscriptionBetService:SubscriptionBetService,
        public _subscriptionPickService:SubscriptionPickService,
        public _bookieService:BookieService
    ){
     //   this.tipster= new User(null,"","","","","",null);
        this.identity = this._userService.getIdentity();
        this.url= GLOBAL.url;
        this.loading=true;
        this.changeAlert=false;
        this.subscriptionBettingList=[];
        this.details={};
        this.error=null;
        this.subscriptionBet=null;
        this.bookiesList=null;
        this.bookieSelected=null;
        this.paramsSearch={};

    }
        
    ngOnInit(){
        this.paramsSearch.startDate = "thismonth";
        this.search();

        this._bookieService.listActiveBookies().toPromise().then(
            r=>this.bookiesList=r
        )

     }


     showCombi(id){
        $( "ul#combinada"+id ).toggle(200);
     }
     showOriginal(id){
        $( "ul#originalBet"+id ).toggle(200);
     }

     showWidgetOdd(id){
        $( "div#widget-odd"+id ).toggle(200);
    }
    showWidgetAmount(id){
        $( "div#widget-amount"+id ).toggle(200);
    }
    showWidgetBookie(id){
        $( "div#widget-bookie"+id ).toggle(200);
    }
    showWidgetResult(id){
        $( "div#widget-result"+id ).toggle(200);
    }
    closeWidgetResult(id){
        $( "div#widget-result"+id ).hide(200);
    }

     changePick(betId,pickId) {
        this.modifiedPickId = pickId;
        setTimeout(() => {
          this.modifiedPickId = null;
        }, 3000);
        var newName = $('#pickEditable' + pickId).html();
        this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);
        let subscriptionPick = this.subscriptionBet.picks.find(o=>o.id===pickId);
        let previousName=  subscriptionPick.pick;
        subscriptionPick.pick=newName;

         this._subscriptionPickService.edit(subscriptionPick).subscribe(

            response => {
                this.modifiedPickId = subscriptionPick.id;
                setTimeout(() => {
                  this.modifiedPickId = null;
                }, 3000);
              },
              error => {
                subscriptionPick.pick=previousName;
                var body = JSON.parse(error._body);
                this.error = body['message'];
                setTimeout(() => {
                  this.error = null;
                }, 3000);
        
              }
         );
      }

      changeOdd(betId,pickId) {
       this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);
       let subscriptionPick = this.subscriptionBet.picks.find(o=>o.id===pickId);

        this._subscriptionPickService.edit(subscriptionPick).subscribe(

           response => {
               this.modifiedOddId = subscriptionPick.id;
               this.showWidgetOdd(this.modifiedOddId);
               this.details=this._subscriptionBetService.calculateCombiDetails(this.subscriptionBettingList);
               this.changeAlert=!this.changeAlert;
        let pos = this.subscriptionBettingList.indexOf(this.subscriptionBettingList.find(o => o.id ===  this.modifiedOddId ));
               setTimeout(() => {
                
                 this.modifiedOddId = null;
               }, 3000);
             },
             error => {
               var body = JSON.parse(error._body);
               this.error = body['message'];
               setTimeout(() => {
                 this.error = null;
               }, 3000);
       
             }
        );
     }

     changeAmount(betId) {
       
        this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);
         this._subscriptionBetService.edit(this.subscriptionBet).subscribe(
            response => {
                this.modifiedAmountId = this.subscriptionBet.id;
                this.showWidgetAmount(this.modifiedAmountId);
                this.details=this._subscriptionBetService.calculateCombiDetails(this.subscriptionBettingList);
                this.changeAlert=!this.changeAlert;
                let pos = this.subscriptionBettingList.indexOf(this.subscriptionBettingList.find(o => o.id ===  this.modifiedOddId ));
                setTimeout(() => {
                  this.modifiedAmountId = null;
                }, 2000);
              },
              error => {
                var body = JSON.parse(error._body);
                this.error = body['message'];
                setTimeout(() => {
                  this.error = null;
                }, 3000);
        
              }
         );
      }

      changeBookie(betId) {
        this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);
        let bookie=this.bookiesList.find(b=>b.id==this.bookieSelected);
        this.subscriptionBet.bookie=bookie;
         this._subscriptionBetService.edit(this.subscriptionBet).subscribe(
            response => {
                //this.modifiedAmountId = this.subscriptionBet.id;
                this.showWidgetBookie(this.subscriptionBet.id);
                //this.details=this._subscriptionBetService.calculateCombiDetails(this.subscriptionBettingList);
                setTimeout(() => {
                  this.modifiedAmountId = null;
                }, 2000);
              },
              error => {
                var body = JSON.parse(error._body);
                this.error = body['message'];
                setTimeout(() => {
                  this.error = null;
                }, 3000);
              }
         );
      }


      setResultPick(betId,pickId,result=null){
        this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);

        if(result!=null){
            this.subscriptionBet.picks.find(o=>o.id===pickId).result = result;
        }
        
        //subscriptionPick.result=result;
        this._subscriptionBetService.resolve(this.subscriptionBet).subscribe(
           response => {
               this.details=this._subscriptionBetService.calculateCombiDetails(this.subscriptionBettingList);
               this.changeAlert=!this.changeAlert;
               this.closeWidgetResult(pickId);
             },
             error => {
               var body = JSON.parse(error._body);
               this.error = body['message'];
               setTimeout(() => {
                 this.error = null;
               }, 3000);
       
             }
        );
      }


      setResultBet(betId,result){
        this.subscriptionBet = this.subscriptionBettingList.find(o => o.id === betId);

        this.subscriptionBet.picks.forEach(pick => {
            if(result==12){
                pick.result=12;
            }
            if(result==11){
                if(pick.result==0 )
                    pick.result=11;
                if(pick.result==1)
                    pick.result=6;
                if(pick.result==2)
                    pick.result=7;
                if(pick.result==3)
                    pick.result=8;
                if(pick.result==4)
                    pick.result=9
                if(pick.result==5)
                    pick.result=10;
            }
            
        });

        this._subscriptionBetService.resolve(this.subscriptionBet).subscribe(
           response => {
               this.details=this._subscriptionBetService.calculateCombiDetails(this.subscriptionBettingList);
               this.changeAlert=!this.changeAlert;
             },
             error => {
               var body = JSON.parse(error._body);
               this.error = body['message'];
               setTimeout(() => {
                 this.error = null;
               }, 3000);
       
             }
        );
      }




      disableEnter(id) {
        $('#pickEditable' + id).on("keypress", function (e) {
            var key = e.keyCode || e.charCode;  // ie||others
            if (key == 13) {
      
              $(this).blur();
            }
      
          });
          
      }


      receiveFilters(event){
        this.paramsSearch=event.filter;
        this.search();
    }

    receiveTipster(event){
        if (event.tipster)
        this.tipsterSearch= event.tipster.id;
        else this.tipsterSearch=null;
        if (!this.paramsSearch.startDate) 
            this.paramsSearch.startDate = "thismonth";
        this.search();
    }

    search() {
        let type;
        let result = {};
        /*
        if (params.type == "simple") {

        }
        if (params.type == "combi") {

        }
        if (params.type == "live") {

        }
        */
       
        if (this.paramsSearch.status == "00") {
            result = { "is": 0 };
        }
        if (this.paramsSearch.status == 1) {
            result = { "is not": 0 };
        }

        let s = {
            "subscription_bet.user_id": { "is": this.identity.id },
            "competition.id": { "is": this.paramsSearch.competition },
            "country.id": { "is": this.paramsSearch.country },
            "sport.id": { "is": this.paramsSearch.sport },
            "subscription_bet.bookie_id": { "is": this.paramsSearch.bookie },
            "subscription_pick.result": result,
            "subscription_pick.pick": { "contains": this.paramsSearch.pick },
            "bet.user_id":{ "is": this.tipsterSearch }
        }

        let date = new Date();
        var f = null;
        var f2 = null;

        //completamos search especificando las fechas de los eventos a buscar
        //por otra parte, establecemos f y f2, que nos servirán para revisar la lista de apuestas devueltas
        //y eliminar las posibles combinadas que no se resuelvan en ese rango de fechas.
        
        if (this.paramsSearch.startDate == "thismonth") {
            s = $.extend(s, { "event.date": { "month": (date.getMonth() + 1), "year": date.getFullYear() } });
            f = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
            f2=new Date(date.getFullYear(),date.getMonth()+1,0,23,59,59,0);
        }
        else if (this.paramsSearch.startDate == "all") {
            s = $.extend(s, { "event.date": null });
        }
        else {
            f = new Date(this.paramsSearch.startDate.getFullYear(), this.paramsSearch.startDate.getMonth(), 1, 0, 0, 0, 0);

            if (!this.paramsSearch.endDate) {
                s = $.extend(s, { "event.date": { "month": (this.paramsSearch.startDate.getMonth() + 1), "year": this.paramsSearch.startDate.getFullYear() } });
                f2 = new Date(this.paramsSearch.startDate.getFullYear(), this.paramsSearch.startDate.getMonth() + 1, 0, 23, 59, 59, 0);
            } else {
                f2 = new Date(this.paramsSearch.endDate.getFullYear(),this.paramsSearch.endDate.getMonth()+1,0,23,59,59,0);

                let startCondition = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + 1;
                let endCondition = f2.getFullYear() + "-" + (f2.getMonth() + 1) + "-" + f2.getDate()+ " 23:59:59";
                
                s = $.extend(s, { "event.date": { "between": "'" + startCondition + "' AND '" + endCondition + "'" } });
            }
        }
        this.loading = true;
        this._subscriptionBetService.advancedBettingSearch(s).then(
            response => {
                // this.bettingList=response;
                if (this.paramsSearch.startDate != null && this.paramsSearch.startDate != "all") {
                    this.subscriptionBettingList = this._subscriptionBetService.checkBettingList(response, { 'start': f, 'end': f2 });
                } else {
                    this.subscriptionBettingList = this._subscriptionBetService.checkBettingList(response);
                }

                this.details = this._subscriptionBetService.calculateCombiDetails(response);
                this.changeAlert=!this.changeAlert;
                this.loading = false;
                this._subscriptionBetService.loadOriginalBettingList(this.subscriptionBettingList).then(
                    ()=>this.changeAlert=!this.changeAlert
                    )
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
