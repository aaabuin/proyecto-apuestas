import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';

import { UserService } from './user.service';
import { BookieService } from './bookie.service';
import { SubscriptionPickService } from './subscriptionPick.service';
import { BetService } from './bet.service';

import { SubscriptionBet } from '../models/subscriptionBet';

@Injectable()
export class SubscriptionBetService {
    public url: string;
    public token;

    constructor(
        private _http: Http,
        private _userService: UserService,
        private _subscriptionPickService: SubscriptionPickService,
        private _bookieService: BookieService,
        private _betService: BetService
    ) {
        this.url = GLOBAL.url;
        this.token = this._userService.getToken();
    }


    add(subscriptionBet) {
        let params = JSON.stringify(subscriptionBet);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });

        return this._http.post(this.url + 'subscriptionBet/', params, { headers: headers }).map(res => res.json());
    }

    edit(subscriptionBet) {
        let params = JSON.stringify(subscriptionBet);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });

        return this._http.put(this.url + 'subscriptionBet/', params, { headers: headers }).map(res => res.json());
    }

    resolve(subscriptionBet) {
        let params = JSON.stringify(subscriptionBet);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        
        return this._http.post(this.url + 'subscriptionBet/result/', params, {headers:headers}).map(res => res.json());
    }
    advancedBettingSearch(key) {
        let params = JSON.stringify(key);
        let headers = new Headers({ 
            'Content-Type': 'application/json' ,
            'Authorization': this.token});
        return this.completeSubscriptionBettingList(this._http.get(this.url + 'subscriptionBet/advancedSearch/' + params, { headers: headers }).map(res => res.json()));

    }


    sendBetEmail(subscriptionBet) {
        let params = JSON.stringify(subscriptionBet);
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });

        return this._http.put(this.url + 'subscriptionBet/email/', params, { headers: headers }).map(res => res.json());
    }

    completeSubscriptionBettingList(bettingList) {


        return bettingList.toPromise().then(
            list => {
                return Promise.all(list.map(bet => {
                    return this.completeSubscriptionBet(bet)
                }))
            });

    }

    /*
    DEVOLVEMOS subscriptionBet.bet como un number
    devolver como new Bet(id,null,null...)???
    */
    completeSubscriptionBet(sbet) {
        //console.log("first look:" + JSON.stringify(sbet));
        return Promise.all([
            this._bookieService.getById(sbet.bookieId).toPromise(),
            this._subscriptionPickService.getSubscriptionsPicksOfBet(sbet.id)
        ]
        ).then(
            ([bookie, picks]) => {
                return new SubscriptionBet(sbet.id, sbet.amount, sbet.coment, bookie, sbet.userId, sbet.createdAt, sbet.updatedAt, picks, sbet.betId);
            }
            )
            .catch(
            (error) => {
                return new SubscriptionBet(sbet.id, sbet.amount, sbet.coment, sbet.bookieId, sbet.userId, sbet.createdAt, sbet.updatedAt, sbet.picks, sbet.betId);
                //new SubscriptionBet(sbet.id, sbet.stake, bet.argument, bet.bookieId, bet.userId, bet.createdAt, bet.updatedAt, bet.picks);
            }
            );
    }

    favBookiesList(id){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'subscriptionBet/bookies/' + id, { headers: headers }).map(res => res.json());

    }
    favCompetitionsList(id){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'subscriptionBet/competitions/' + id, { headers: headers }).map(res => res.json());
    }
    favSportsList(id){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'subscriptionBet/sports/' + id, { headers: headers }).map(res => res.json());
    }
    favCountriesList(id){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'subscriptionBet/countries/' + id, { headers: headers }).map(res => res.json());
    }

    activeMonthsList(id){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        return this._http.get(this.url + 'subscriptionBet/activeMonths/' + id, { headers: headers }).map(res => res.json());
    }


    //RECIBE UNA LISTA DE SUBSCRIPTIONBETS 
    //pARA cADA SUBSCRIPTIONBET DE LA LISTA, completa su bet original 
    loadOriginalBettingList(bettingList) {
        return Promise.all(bettingList.map(bet => {
            return this._betService.getById(bet.bet).toPromise()
        }
        )).then(
            r => {
                return Promise.all(r.map(b => {
                    //para cada bet completamos su bookie
                    return this._betService.completeBetBasicWithBookie(b);
                }
                ))
            }
            ).then(z => {
                //guardamos  la apuesta completa con la bookie en su sitio final
                return Promise.all(bettingList.map(bt => {
                    bt.bet = z.find(o => o.id === bt.bet);
                    return bt;
                }));
            });

    }


    checkBettingList(bettingList, date = null) {
        let details = this.calculateCombiDetails(bettingList);
        for (var i = 0; i < bettingList.length; i++) {

            var betDate = null;

            if (date != null) {
                betDate = new Date(details[bettingList[i].id].date);

            }
            if ((betDate != null && date.start && date.end && (date.start > betDate || date.end < betDate)) ||
                !bettingList[i].bookie || !bettingList[i].picks || bettingList[i].picks.length == 0 ||
                this._subscriptionPickService.checkPicks(bettingList[i].picks) == 0) {
                bettingList.splice(i, 1);
                i--;
            }
        }
        return bettingList;
    }

    calculateOdd(bet) {
        if (bet.picks) {
            let finalOdd = 1;
            bet.picks.forEach(pick => {
                if (pick.result != 3 && pick.result != 8 && pick.result != 12) {
                    finalOdd = finalOdd * pick.odd;
                }

            });
            return Number(finalOdd.toFixed(2));
        } else {
            return 0;
        }
    }

    /* 
    posibles resultados:
    0:pendiente
    1: acierto
    2: fallo
    3: nulo
    4: semifallo
    5: semiacierto
    */
    calculateResult(bet) {
        if (bet.picks) {
            let finalResult = null;
            bet.picks.forEach(pick => {
                if (finalResult == null) {
                    finalResult = pick.result;
                }
                else{
                    if (pick.result == 2) {
                        finalResult = 2;
                    }
                    if (pick.result == 7 && finalResult != 2) {
                        finalResult = 7;
                    }
                    if (pick.result == 0 && finalResult != 2 && finalResult != 7) {
                        finalResult = 0;
                    }
                    if (pick.result == 11 && finalResult != 2 && finalResult != 7 && finalResult != 0) {
                        finalResult = 11;
                    }
                    
                    if (pick.result == 5 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 ) {
                        finalResult = 5;
                    }
                    if (pick.result == 10 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5) {
                        finalResult = 10;
                    }

                    if (pick.result == 4 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11 && finalResult != 5 
                        && finalResult != 10) {
                        finalResult = 4;
                    }
                    if (pick.result == 9 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5
                        && finalResult != 10 && finalResult != 4) {
                        finalResult = 9;
                    }


                    if (pick.result == 1 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5 
                        && finalResult !=10 && finalResult !=4 && finalResult !=9) {
                        finalResult = 1;
                    }
                    if (pick.result == 6 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5 
                        && finalResult !=10 && finalResult !=4 && finalResult !=9 && finalResult !=1 ) {
                        finalResult = 6;
                    }
                    if (pick.result == 3 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5 
                        && finalResult !=10 && finalResult !=4 && finalResult !=9 && finalResult !=1 && finalResult !=6) {
                        finalResult = 3;
                    }
                    if (pick.result == 8 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5 
                        && finalResult !=10 && finalResult !=4 && finalResult !=9 && finalResult !=1 && finalResult !=6 && finalResult !=3) {
                        finalResult = 8;
                    }
                    if (pick.result == 12 && finalResult != 2 && finalResult != 7 && finalResult != 0 && finalResult != 11  && finalResult !=5 
                        && finalResult !=10 && finalResult !=4 && finalResult !=9 && finalResult !=1 && finalResult !=6 && finalResult !=3 
                        && finalResult!=8) {
                        finalResult = 12;
                    }
                }
            });
            return finalResult;
        } else {
            return 0;
        }
    }

    calculateDate(bet) {
        if (bet.picks) {
            let finalDate = 0;
            bet.picks.forEach(pick => {
                if (finalDate == 0 || pick.event.date > finalDate)
                    finalDate = pick.event.date;
            });
            return finalDate;
        } else {
            return 0;
        }
    }


    //Texto resumido de los eventos de una apuesta (combinada y simple?)
    calculateEventDescription(bet) {
        if (bet.picks) {
            let desciption = "";
            bet.picks.forEach(pick => {
                if (pick.event.name) {
                    if (desciption == "") {
                        desciption = pick.event.name;
                    } else {
                        desciption = desciption + " + " + pick.event.name;
                    }
                }
            });
            return desciption;
        } else {
            return 0;
        }
    }

    calculateCombiDetails(bettingList) {
        let details = {};
        bettingList.forEach(bet => {
            details[bet.id] = { odd: this.calculateOdd(bet), date: this.calculateDate(bet), result: this.calculateResult(bet), description: this.calculateEventDescription(bet) };
        });


        return details;
    }


    modifySubscriptionBet(subscriptionBet){
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.token
        });
        return this._http.put(this.url + 'subscriptionBet/', {subscriptionBet:subscriptionBet}, { headers: headers }).map(res => res.json());
    }

    
}