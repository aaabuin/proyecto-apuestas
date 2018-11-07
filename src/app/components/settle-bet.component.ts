import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Bet } from '../models/bet';
import { Pick } from '../models/pick';
import { User } from '../models/user';

import { PickService } from '../services/pick.service';
import { BetService } from '../services/bet.service';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';

import { SubscriptionPickService } from '../services/subscriptionPick.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'settle-bet',
  templateUrl: '../views/settle-bet.html'
})

export class SettleBetComponent implements OnInit {

  public identity;
  //public success:string;
  public error: string;
  public url: string;
  public modifiedPicks:Array<Pick>;

  @Input() bet: Bet;
  @Output() settledBet = new EventEmitter();

  constructor(
    private _userService: UserService,
    private _betService: BetService,
    private _subscriptionPickService: SubscriptionPickService
  ) {
    this.url = GLOBAL.url;
    this.modifiedPicks=[];

  }

  ngOnInit() {
    //copiamos el objeto por valor
    this.modifiedPicks= JSON.parse(JSON.stringify(this.bet.picks) );
    
   }

  determineBet() {
    //ES IMPORTANTE NO REALIZAR NUNCA COPIA POR REFERENCIA
    //SI RESOLVEMOS COMBINADAS PUEDEN VERSE AFECTADAS
    let originalBet= JSON.parse(JSON.stringify(this.bet) );
    this.bet.picks= JSON.parse(JSON.stringify(this.modifiedPicks));
    this._betService.determineBet(this.bet).toPromise().then(
      response => {
        
        this.bet.picks.forEach(pick => {
          this._subscriptionPickService.updateSubscriptionPicksResults(pick);
        });
        //
        //
        //+
        //
        //
        //FALTA DETERMINAR SUBBETS
        this.emitEvent()
      },
      error => {
        this.bet=originalBet;
       this.error = JSON.parse(error._body).message;
        //this.success= null;   
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    )
    

  }

  dimissChanges(){
    //si deseamos deshacer los cambios en cancelar
    //this.modifiedPicks= JSON.parse(JSON.stringify(this.bet.picks) );
  }

  emitEvent() {
    this.settledBet.emit({ settledBet: this.bet });
  }

}