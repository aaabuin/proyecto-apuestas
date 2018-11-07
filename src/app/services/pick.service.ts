import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { UserService } from './user.service';

import { EventService } from './event.service';
import { BookieService } from './bookie.service';

import { Pick } from '../models/pick';
import { Bookie } from '../models/bookie';
import { Event } from '../models/event';


@Injectable()
export class PickService {
    public url: string;
    public token;

    constructor(
        private _http: Http,
        private _userService: UserService,
        private _eventService: EventService,
        private _bookieService: BookieService
    ) {
        this.url = GLOBAL.url;
        this.token = this._userService.getToken();
    }



    addPicksList(picks) {

        return Promise.all(picks.map(pick => {
            pick.apuestaId = 1;
            return this.add(pick).toPromise();
        }));
        //////////////////////////////////SOBRA?????///////////////////////////////////////////////////
    }


    //recibe una lista de pronosticos, deben tener pronostico.apuesta_id
    //devolvemos apuesta_id 
    addPicksOfBet(bet) {
        return Promise.all(bet.picks.map(pick => {
            pick.betId = bet.id;
            return this.add(pick).toPromise().then(
                r => {
                    pick.id = r;
                    return pick;
                }
            );
        })
        ).then(a => {
            return bet;
        }).catch(e => {
            return Promise.reject(e);
        });
        /////////////////////////////////////////////////////////////////////////////////////
    }

    add(pick) {
        let params = JSON.stringify(pick);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.post(this.url + 'pick/', params, { headers: headers }).map(res => res.json());
    }


    /*
    NO USADA??????


    advancedPicksSearch(clave){
        let params = JSON.stringify(clave);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completarListaPronosticos(this._http.get(this.url+'pick/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));
        
    }
    */

    getPicksOfBet(id) {
        let key = {
            bet_id: { 'is': id }
        }
        let params = JSON.stringify(key);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this.completePicksList(this._http.get(this.url + 'pick/advancedSearch/' + params, { headers: headers }).map(res => res.json()));
    }

    completePicksList(picksList) {

        return picksList.toPromise().then(picks =>
            Promise.all(picks.map(pick => {
                return this.completePick(pick);
            }
            )).then(
                fullPick => { return fullPick; }
            )
        )
    }


    completePick(pick) {

        return Promise.all([
            this._eventService.getById(pick.eventId).toPromise(),
            Promise.resolve(pick)
        ]).then(
            ([event, pick]) => {
                //           pronostico.casa=bookie;
                return this._eventService.completeEvent(event)

            }
        )
            .then(
                e => {
                    return new Pick(pick.id, pick.pick, pick.odd, pick.result, e, pick.betId);
                }
            )

    }


    //Get Basic Picks of BET
    getBasicPicks(id) {
        let key = {
            bet_id: { 'is': id }
        }
        let params = JSON.stringify(key);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'pick/advancedSearch/' + params, { headers: headers }).map(res => res.json());
    }



    getPicksListWithEvents(id) {
        let key = {
            bet_id: { 'is': id }
        }
        let params = JSON.stringify(key);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this.getPicksWithEvents(this._http.get(this.url + 'pick/advancedSearch/' + params, { headers: headers }).map(res => res.json()));
    }
    getPicksWithEvents(picksList) {
        return picksList.toPromise().then(
            pList => { 
                return Promise.all(pList.map(pick => {
                   // return this.completeBetBasic(bet);
                return this._eventService.getById(pick.eventId).toPromise().then(
                    e => {
                        pick.event = e;
                        return pick;
                    }
                )
            }
            ))
            } 
        )
    }




    //funcion para comprobar si el listado this.pronosticos
    //está completo => devuelve 1
    //falta algun dato => 0
    checkPicks(picks) {
        let error = 0;
        if (!picks || picks.length == 0) {
            error = 1;
        } else {
            picks.forEach(p => {
                if (!p.event || !p.odd || p.odd < 0.25 || !p.pick || p.pick.trim().length < 2)
                    error = 1;
            });
        }
        if (error == 0)
            return 1;
        else
            return 0;
    }


}