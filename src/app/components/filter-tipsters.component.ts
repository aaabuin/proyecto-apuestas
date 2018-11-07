import { Component, OnInit, Output, Input , EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';


import { GLOBAL } from '../services/global';
import { BookieService } from '../services/bookie.service';
import { CompetitionService } from '../services/competition.service';
import { SportService } from '../services/sport.service';
import { CountryService } from '../services/country.service';
//import { Bookie } from '../models/bookie';

@Component({
    selector: 'filter-tipsters',
    templateUrl: '../views/filter-tipsters.html',
    providers: [
        BookieService,
        CompetitionService,
        SportService,
        CountryService
    ]
})


export class FilterTipstersComponent implements OnInit {

    public orderList:any;
    public order:string;
    public numPicks:number;
    public minYield:number;
    public winsAverage:number;
    public tipsterName:string;
    
    public period;
    public periodsList:any;
    public sport: string;
    public sportsList: Array<any>;
    public country: string;
    public countriesList: Array<any>;
    public competition: string;
    public competitionsList: Array<any>;

    public url: string;

    @Output() filter = new EventEmitter();

    constructor(
        private _route: ActivatedRoute,
        public _bookieService: BookieService,
        public _competitionService: CompetitionService,
        public _sportService: SportService,
        public _countryService: CountryService
    ) {
        this.url = GLOBAL.url;
        this.tipsterName="";
    }

    ngOnInit() {
        this.periodsList = [
            {value:"thismonth",name:"Mes actual"},
            {value:"last3m",name:"Ultimos 3 meses"},
            {value:"last6m",name:"Ultimos 6 meses"},
            {value:"all",name:"Todo"}
        ];

        this.orderList=[
            {value:"yield",name:"Yield"},
            {value:"success",name:"% Acierto"},
            {value:"amountPicks",name:"Numero de apuestas"},
            {value:"profit",name:"Beneficios"}

        ];
        this._sportService.listActiveSports().subscribe(
            response=> {
                this.sportsList=response;
                
            },
            error=>console.log("Error cargando deportes.")
        );
        this._countryService.listActiveCountries().subscribe(
            response=> {
                this.countriesList=response;
                
            },
            error=>console.log("Error cargando deportes.")
        )



    }

    emitFilter() {

        let filter = {
            tipster:this.tipsterName,
            numPicks: this.numPicks,
            winsAverage:this.winsAverage,
            yield:this.minYield,
            order:this.order,
            period:this.period,
            sport:this.sport,
            country:this.country,
            competition:this.competition
        }

        this.filter.emit({ filter });
    }

    loadCompetitions(){
        let search: any;

        search = {
        status: { 'is': 1 },
        sport_id: { 'is': this.sport },
        country_id: { 'is': this.country }
        }
        this._competitionService.advancedCompetitionsSearch(search).then(
            response=>{
                this.competitionsList=response;
            }
        )
        this.emitFilter();
    }

}