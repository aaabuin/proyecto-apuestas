import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import {GLOBAL} from './global';

import { UserService } from './user.service';
import { EventService } from './event.service';
//import {BookieService} from './bookie.service';
import { Event } from '../models/event';
import { SubscriptionPick } from '../models/subscriptionPick';
/*
import { Bookie } from '../models/bookie';
*/


@Injectable()
export class SubscriptionPickService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService,
        private _eventService: EventService,
       // private _bookieService: BookieService
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    
    //recibe una lista de pronosticos,
    // deben tener pick.betId
    //devolvemos apuesta_id 
    addPicksOfSubscriptionBet(subscriptionBet){
         return Promise.all(subscriptionBet.picks.map(subscriptionPick => {
            //SI PONEMOS RETURN  EN ADD PARA ANTE EL FALLO PERO DEVUELVE LOS subscriptionBetId MEZCLADOS
            //aunque a la bd llegan bien
            subscriptionPick.pickId=subscriptionPick.id;
            this.add(subscriptionPick).toPromise();
            })
        ).then(
            ()=>{
                return subscriptionBet;
            }
        ).catch(e=>{
            return Promise.reject(e);
        });
    }



    add(spick){
        let params = JSON.stringify(spick);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url+'subscriptionPick/',params,{headers:headers}).map(res=>res.json());
    }

    edit(subscriptionPick) {
        let params = JSON.stringify(subscriptionPick);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        
        return this._http.put(this.url + 'subscriptionPick/', params, { headers: headers }).map(res => res.json());
    }

    resolvePick(subscriptionPick) {
        
        let params = JSON.stringify(subscriptionPick);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url + 'subscriptionPick/result/', params, { headers: headers }).map(res => res.json());
    }
    
    


    getSubscriptionsPicksOfBet(id){
        let key = {
            subscription_bet_id: {'is': id}
        }
        let params = JSON.stringify(key);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completePicksList(this._http.get(this.url+'subscriptionPick/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));
    }

    //actualiza los resultados de los subscriptionPicks
    //en funcion del resultado del pick original recibido
    updateSubscriptionPicksResults(pick){
        //obtenemos la lista de subscriptionpicks referentes al pick original
        this.getSubscriptionsPicksOfOriginal(pick.id).then(
            picksList=>{
                //para cada pick de la lista obtenida...si el resultado es pendiente(0)
                //o bien realizado(11). actualizamos el resultado y guardamos el subcription pick
                picksList.forEach(p => {
                    if (p.result==0||p.result==11){
                        p.result=pick.result;
                        this.resolvePick(p).subscribe();
                    }
                });
            }
        )
    }

    getSubscriptionsPicksOfOriginal(originalPickId){
        let key = {
            pick_id: {'is': originalPickId}
        }
        let params = JSON.stringify(key);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completePicksList(this._http.get(this.url+'subscriptionPick/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));
    }

    completePicksList(subscriptionPicksList){

        return subscriptionPicksList.toPromise().then(spicks =>
            Promise.all(spicks.map(pick => {
                return this.completePick(pick);
            }
            )).then(
                fullPick => {
                    return fullPick;}
                )
            )
    }

    completePick(pick){
            return this._eventService.getById(pick.eventId).toPromise()
            .then(
            (event) => {
                return this._eventService.completeEvent(event)
                }
            )
            .then(
                e =>{
                    return new SubscriptionPick(pick.id, pick.pick, pick.odd, pick.result, e, pick.subscriptionBetId, pick.pickId);
                }
            )
    }

    checkPicks(picks){
        let error=0;
        if(!picks||picks.length==0){
            error=1;
        }else{
            picks.forEach(p => {
            if(!p.event||!p.odd||p.odd<0.25||!p.pick||p.pick.trim().length<2)
                error=1;
            });
        }
        if (error==0)
            return 1;
        else
         return 0;
    }

}