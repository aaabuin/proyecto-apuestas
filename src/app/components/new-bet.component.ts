import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { Bet } from '../models/bet';
import { Pick } from '../models/pick';
import { User } from '../models/user';

import { Bookie } from '../models/bookie';


import { BookieService } from '../services/bookie.service';
import { PickService } from '../services/pick.service';
import { BetService } from '../services/bet.service';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { SubscriptionService } from '../services/subscription.service';
//import { UploadService } from '../services/upload.service';

declare var jQuery:any;
declare var $:any;


@Component({
    selector: 'new-bet',
    templateUrl: '../views/new-bet.html',
    providers: [
        UserService,
        PickService,
        BetService,
        BookieService
        ]
})

export class NewBetComponent implements OnInit{
    public user: User;
    public identity;
    public success:string;
    public error:string;
    public bookiesList:Array<Bookie>;
    public url:string;
    public bet:Bet;
    public bookie:Bookie;
    public selectedPick:number;
    public picks:Array<Pick>;
    public oddCombi:number;
    public bookieFilter:string; 
    itemsBookie: number = 5;

    constructor(
        private _route: ActivatedRoute,
        private _router:Router,
        private _userService: UserService,
        //private _uploadService: UploadService,
        private _bookieService: BookieService,
        private _pickService: PickService,
        private _betService: BetService,
        private _subscriptionService: SubscriptionService
    ){
        this.identity = this._userService.getIdentity();
        //modificar constructor
        this.bet= new Bet(null,null , "" ,null,null,null,null,null );
        this.bookie=new Bookie(null,null,null,null, null,null);
        
        this.url= GLOBAL.url;
        this.bookiesList=[];
        this.oddCombi=1;
        this.bookieFilter="";
        this.selectedPick=0;
        this.picks=[];
        
    }
        
    ngOnInit(){
        this.picks.push (new Pick(null, "", null,null,null, null));
        this.filterBookies();
    }

    orderFavouritesBookies(){
        let finalList:Array<any>=[];
        this._betService.favBookiesList(this.identity.id).toPromise().then(
            lBookies=>{
                for (var i = 0, max = lBookies.length; i < max; i += 1) {
                    let pos= this.bookiesList.findIndex(o => o.id === lBookies[i].bookie_id);
                    if(pos>=0)
                    finalList=finalList.concat(this.bookiesList.splice(pos,1));
                   }
                this.bookiesList= finalList.concat(this.bookiesList);
            }
        )
    }

    assignBookie(idBookie){
        this.bet.bookie =this.bookiesList.find(o=>o.id===idBookie);
    }

 //actualiza la lista de competiciones mostrada en el buscador 
  //en funcion del deporte y del pais seleccionados
    filterBookies(){
        let search = {  
            name:{'contains': this.bookieFilter},
            status: { 'is': 1 },
            "OR":{
                status:{'is':2},
                user_id:{'is':this.identity.id},
                name:{'contains': this.bookieFilter}
            },
            "ORDER BY":{user_id: "DESC" }
        }
            this._bookieService.advancedBookiesSearch(search).subscribe(
                response => {
                    this.bookiesList = response;
                    this.orderFavouritesBookies();
            }
            );
    }
    
    
    cleanBookiesFilter(){
        this.bookieFilter="";
        this.itemsBookie=10;
        this.bet.bookie=null;
        this.filterBookies();
    }
    
    publicBet(){
        if (this._pickService.checkPicks(this.picks)==1){
            this.bet.picks=this.picks;
            this.bet.user=new User(this.identity.id,this.identity.username,"","","","",null);
       
            this._betService.saveBet(this.bet).then(
                response=>{
                    this._subscriptionService.generateSubscriptionBet(response);
                    this.success="Apuesta publicada correctamente.";
                    this.bet=new Bet(null,null , "" ,null,null,null,null,null );
                    this.picks=[];
                    this.picks.push(new Pick(null, "", null,null,null,null));
                    setTimeout(() => {
                        this.success=null;
                    }, 3000);
                }
            ).catch(
                error=>{
                    this.error=error;
                    setTimeout(() => {
                        this.error=null;
                    }, 3000);
                }
            );
        }else{
            this.error="Faltan datos.";
            setTimeout(() => {
                this.error=null;
            }, 3000);
        }
    }



    saveBookie()
    {
        this.bookie.status=2;
        this.bookie.image="";
        this.bookie.createdAt=null;
        this._bookieService.add(this.bookie).subscribe(
            response=>{
                this.bookie.id=response;
                this.success="Bookie añadida correctamente.";
                this.bookiesList.push(this.bookie);
                this.bet.bookie=this.bookie;
                this.bookie=new Bookie(null,null , null,null, null,null );
                this.filterBookies();
                setTimeout(() => {
                    this.success=null;
                }, 3000);
            },
            error=>{
                this.error=JSON.parse(error._body).message;
                this.success= null;   
                setTimeout(() => {
                    this.error=null;
                }, 3000);
            }
        )
    }

    combinePick(){
         this.picks.push( new Pick(null, "", null,null,null,null));
         this.selectedPick++;
    }

    culcaulteOdd(){
        let finalOdd=1;
        this.picks.forEach(p => {
            if(p.odd)
            finalOdd=finalOdd*p.odd;
        });
        this.oddCombi=Number(finalOdd.toFixed(3));
    }

    deletePick(pos){
        this.picks.splice(pos,1);
        this.selectedPick--;
        if(this.picks.length<1){
            this.picks.push(new Pick(null, "", null,null,null,null));
            this.selectedPick=0;
        }
        this.culcaulteOdd();
    }


    showMoreBookies(){
    this.itemsBookie+=5;
    }

    checkPicks(){
        return this._pickService.checkPicks(this.picks);
    }

    showData(event){
        this.picks[this.selectedPick].event=event.event;
        this.scrollToAnchor("details");
    }

    scrollToAnchor(aid){
        var aTag = $("div [name='"+ aid +"']");
        $('html,body').animate({scrollTop: aTag.offset().top},'slow');
    }

}
