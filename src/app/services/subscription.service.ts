import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';

import { SubscriptionBet } from '../models/subscriptionBet';

import { UserService } from './user.service';
import { SubscriptionBetService } from './subscriptionBet.service';
import { SubscriptionPickService } from './subscriptionPick.service';



@Injectable()
export class SubscriptionService {
    public url: string;
    public token;

    constructor(
        private _http: Http,
        private _userService: UserService,
        private _subscriptionBetService: SubscriptionBetService,
        private _subscriptionPickService: SubscriptionPickService
    ) {
        this.url = GLOBAL.url;
        this.token = this._userService.getToken();
    }


    add(subscription) {
        let params = JSON.stringify(subscription);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url + 'subscription/', params, { headers: headers }).map(res => res.json());
    }

    stop(subscription) {
        let params = JSON.stringify(subscription);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.put(this.url + 'subscription/', params, { headers: headers }).map(res => res.json());
    }

    getSubscription(clave) {
        let params = JSON.stringify(clave);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.get(this.url + 'subscription/active/' + params, { headers: headers }).map(res => res.json());
    }

    getSubscriptionByFollower(id) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.get(this.url + 'subscription/follower/' + id, { headers: headers }).map(res => res.json());
    }

    getById(id) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.get(this.url + 'subscription/' + id, { headers: headers }).map(res => res.json());
    }

    /*
    
    */
    getSubscriptionsByTipster(id) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.get(this.url + 'subscription/tipster/' + id, { headers: headers }).map(res => res.json());
    }

    getTipstersOfFollower(key) {

        let params = JSON.stringify(key);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.get(this.url + 'subscription/followed/tipsters/' + params, { headers: headers }).map(res => res.json());
    }


    // RECIBE LA APUESTA ORIGINAL Y COMPLETA UNA VEZ GUARDADA
    //SE BUSCAN LAS SUSCRIPCIONES QUE TIENE EL TIPSTER QUE LA PUBLICA
    //PARA CADA SUSCRIPCION SE GENERA UNA SubscriptionBet, la cual se guarda con sus picks
    //y se envia por correo.
    generateSubscriptionBet(bet) {
        let subsbet = {}
        //consultamos las subscripciones
        this.getSubscriptionsByTipster(bet.user.id).subscribe(
            response => {
                response.forEach(subs => {
                    //para cada suscripcion
                    //generamos la apuesta de la suscripcion
                    //guardamos y enviamos por correo 
                    this._userService.getUserById(subs.followerId).toPromise().then(
                        u => {
                            return new SubscriptionBet(null, bet.stake * subs.amount, "", bet.bookie, u, null, null, bet.picks, bet);
                        }
                    ).then(
                        r => {
                            return this._subscriptionBetService.add(r).toPromise().then(
                                resp => {
                                    r.id = resp;
                                    r.picks.forEach(pick => {
                                        pick.subscriptionBetId = resp;
                                    });
                                    return r;
                                }
                            )
                        }
                    ).then(
                        res => {
                            return this._subscriptionPickService.addPicksOfSubscriptionBet(res);
                        }
                    ).then(
                        r => {
                            this._subscriptionBetService.sendBetEmail(r).subscribe(
                                r => console.log("Emails de apuesta enviados.")
                                ,
                                error => console.log(error)
                            );
                        }
                    ).catch(error => {
                        Promise.reject(error);
                    });
                });
            },
            error => {
                Promise.reject(error);
            }
        );
    }

}