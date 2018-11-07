import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';


import { Pick } from '../models/pick';
import { User } from '../models/user';
import { Bet } from '../models/bet';

import { Competition } from '../models/competition';

import { PickService } from '../services/pick.service';
import { BetService } from '../services/bet.service';
import { SubscriptionBetService } from '../services/subscriptionBet.service';
import { BookieService } from '../services/bookie.service';
import { CompetitionService } from '../services/competition.service';
import { SportService } from '../services/sport.service';
import { CountryService } from '../services/country.service';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';


@Component({
    selector: 'filter-bets',
    templateUrl: '../views/filter-bets.html',
    providers: [
        UserService,
        PickService,
        BetService,
        SubscriptionBetService,
        CompetitionService
    ]
})

export class FilterBetsComponent implements OnInit {

    public startDate;
    public endDate;
    public startPeriod: Array<any>;
    public endPeriod: Array<any>;
    public pickName: string;
    public sport: string;
    public sportsList: Array<any>;
    public country: string;
    public countriesList: Array<any>;
    public competition: string;
    public competitionsList: Array<any>;
    public minOdd: number;
    public maxOdd: number;
    public bookie: string;
    public bookiesList:Array<any>;
    public type: string;
    public status: string;
    public minStake: number;
    public maxStake: number;
    public tipster: number;


    // public settleBet:Bet;
    //public pick:Pick;

    public url: string;
    public loading: boolean;
    public showAllFilters: boolean;

    @Input() key: Array<any>;
    //KEY SIGUE LA FORMA [ x, id]
    // donde x nos indica el service en el que buscar(bet o subscription bet)
    // e id nos indica el id del tipster a buscar.

    @Output() filter = new EventEmitter();

    constructor(
        private _userService: UserService,
        private _route: ActivatedRoute,
        public _betService: BetService,
        public _subscriptionBetService: SubscriptionBetService,
        public _bookieService: BookieService,
        public _competitionService: CompetitionService,
        public _sportService: SportService,
        public _countryService: CountryService
    ) {
        this.url = GLOBAL.url;
        this.startPeriod = [];
        this.endPeriod = [];
        this.showAllFilters=false;
    }

    ngOnInit() {
        this.startDate = "thismonth";
        this.endDate = "startdate";
       // if (this.key)
        //    this.loadFilters(this.key);
    }

    ngOnChanges() {
        if (this.key)
            this.loadFilters(this.key);
    }

    loadFilters(key) {
        //key contiene el service al que debemos llamar(bet/subscriptionbet) y el id del usuario que nos interesa
        let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        this.startPeriod = [];

        if (key[0] == "subscriptionBet") {

            //en subsbetservice llamar a algun metodo que devuelva una lista de tipsters seguidos 
            // crear metodo.



            //cargamos los meses de las apuestas
            this._subscriptionBetService.activeMonthsList(key[1]).subscribe(
                r => {
                    this.startPeriod = [];
                    r.forEach(date => {
                        let d = new Date(date.date);
                        this.startPeriod.push({ value: d, name: months[d.getMonth()] + " " + d.getFullYear() });
                    });

                }
            );
            this._subscriptionBetService.favBookiesList(key[1]).toPromise().then(
                bookies => {
                    //this.competitionList=response;

                    Promise.all(bookies.map(bookie => {
                        return this._bookieService.getById(bookie.bookieId).toPromise()
                    }
                    )).then(
                        r => {
                            this.bookiesList = r;
                        }
                        )
                }
            )

            this._subscriptionBetService.favCompetitionsList(key[1]).toPromise().then(
                competitions => {
                    //this.competitionList=response;
                    Promise.all(competitions.map(competition => {
                        return this._competitionService.getById(competition.competitionId).toPromise()
                    }
                    )).then(
                        r => {
                            this.competitionsList = r;
                        }
                        )
                }
            )

            this._subscriptionBetService.favCountriesList(key[1]).toPromise().then(
                countries => {
                    //this.competitionList=response;
                    Promise.all(countries.map(country => {
                        return this._countryService.getById(country.countryId).toPromise()
                    }
                    )).then(
                        r => {
                            this.countriesList = r;
                        }
                        )
                }
            )

            this._subscriptionBetService.favSportsList(key[1]).toPromise().then(
                sports => {
                    //this.competitionList=response;
                    Promise.all(sports.map(sport => {
                            return this._sportService.getById(sport.sportId).toPromise()
                    }
                    )).then(
                        r => {
                            this.sportsList = r;
                        }
                        )
                }
            )
        }
        else if (key[0] == "bet") {
            //cargamos los meses de las apuestas
            this._betService.activeMonthsList(key[1]).subscribe(
                r => {
                    this.startPeriod = [];
                    r.forEach(date => {
                        let d = new Date(date.date);
                        this.startPeriod.push({ value: d, name: months[d.getMonth()] + " " + d.getFullYear() });
                    });

                }
            );

            this._betService.favBookiesList(key[1]).toPromise().then(
                bookies => {
                    //this.competitionList=response;
                    Promise.all(bookies.map(bookie => {
                        return this._bookieService.getById(bookie.bookieId).toPromise()
                    }
                    )).then(
                        r => {
                            this.bookiesList = r;
                        }
                        )
                }
            )
            this._betService.favCompetitionsList(key[1]).toPromise().then(
                competitions => {
                    //this.competitionList=response;
                    console.log(JSON.stringify("·333··"+JSON.stringify(competitions)))
                    Promise.all(competitions.map(competition => {
                        return this._competitionService.getById(competition.competitionId).toPromise()
                    }
                    )).then(
                        r => {
                            this.competitionsList = r;
                        }
                        )
                }
            )

            this._betService.favCountriesList(key[1]).toPromise().then(
                countries => {
                    //this.competitionList=response;
                    Promise.all(countries.map(country => {
                        return this._countryService.getById(country.countryId).toPromise()
                    }
                    )).then(
                        r => {
                            this.countriesList = r;
                        }
                        )
                }
            )

            this._betService.favSportsList(key[1]).toPromise().then(
                sports => {
                    //this.competitionList=response;
                    Promise.all(sports.map(sport => {
                        return this._sportService.getById(sport.sportId).toPromise()
                    }
                    )).then(
                        r => {
                            this.sportsList = r;
                        }
                        )
                }
            )
        }
    }

    loadDates() {

        if (this.startDate != "thismonth" && this.startDate != "all") {
            this.endPeriod = [];
            let i = this.startPeriod.findIndex(o => o.name === this.startDate);
            this.endPeriod = this.startPeriod.slice(0, i);
        }

        if(this.startDate==this.endDate||this.startDate=="thismonth"||this.startDate=="all")
            this.endDate="startdate";

        this.emitEvent();
    }

    filterBets() {
        this.emitEvent();
    }

    emitEvent() {

        let sDate = { value: "", name: "" };
        let eDate = { value: null, name: null };


        if (this.startDate == "thismonth" || this.startDate == "all"){
            sDate.value = this.startDate;
        }
        else {
            sDate = this.startPeriod.find(o => o.name === this.startDate);
        }

        if ( this.endDate != "startdate"){
            eDate = this.endPeriod.find(o => o.name === this.endDate); 
        }

        let filter = {
            bookie: this.bookie,
            competition: this.competition,
            sport: this.sport,
            country: this.country,
            pick: this.pickName,
            type: this.type,
            status: this.status,
            startDate: sDate.value,
            endDate: eDate.value
        }

        this.filter.emit({ filter });
    }

    showMoreSearchOptions(){
        this.showAllFilters=!this.showAllFilters;
    }

}