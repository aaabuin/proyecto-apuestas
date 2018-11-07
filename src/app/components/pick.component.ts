import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Pick } from '../models/pick';
import { User } from '../models/user';
import { Bet } from '../models/bet';

import { PickService } from '../services/pick.service';
import { BetService } from '../services/bet.service';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';


@Component({
    selector: 'pick',
    templateUrl: '../views/pick.html',
    providers: [
        UserService,
        PickService,
        BetService
        ]
}) 

export class PickComponent implements OnInit{
    public url:string;
    public error;
    public bet:Bet;
    public odd:number;
    public result:number;

    constructor(
        private _userService: UserService,
        private _route: ActivatedRoute,
        public _betService:BetService
    ){
        this.url = GLOBAL.url;
        this.bet= new Bet(null, null, "", null, null, null, null, null);
        this.error=null;
        this.odd=null;
        this.result=null;
    }
        
    ngOnInit(){
        let id;
        this._route.params.forEach((params:Params) => {
            id=params['id'];
        });

        this._betService.getById(id).subscribe(
            response=>{
                this._betService.completeBet(response).then(
                    fullBet=>{
                        this.bet=fullBet;
                        this.result=this._betService.calculateResult(fullBet);
                        this.odd=this._betService.calculateOdd(fullBet);
                    }
                );
                
            },
            error=>{
                this.error=JSON.parse(error._body).message;
            }
        );
    }
}