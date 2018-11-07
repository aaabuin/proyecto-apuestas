import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

import { Competition } from '../../models/competition';
import { Sport } from '../../models/sport';
import { Country } from '../../models/country';

import { UserService } from '../../services/user.service';
import { CompetitionService } from '../../services/competition.service';
import { SportService } from '../../services/sport.service';
import { CountryService } from '../../services/country.service';
//import { DeporteServicio } from '../services/deporte.servicio';
declare var jQuery: any;
declare var $: any;


@Component({
  selector: 'competitions',
  templateUrl: '../views/competitions.html',
  providers: [UserService, CompetitionService, SportService, CountryService]
})

export class CompetitionsComponent implements OnInit {

  public competition: Competition;
  public identity;
  public error: string;
  public success: string;
  public competitionsList: Array<Competition>;
  public countriesList: Array<Country>;
  public sportsLists: Array<Sport>;
  public modifiedNameId: number;
  public url: string;
  public edition: number;
  public sort: Array<String>;

  public filter: string;
  public statusFilter: number;
  public sportFilter: number;
  public countryFilter: number;

  constructor(
    private _userService: UserService,
    private _competitionService: CompetitionService,
    private _sportService: SportService,
    private _countryService: CountryService
  ) {
    this.url = GLOBAL.url ;
    this.sort= ["",""];
    this.competitionsList=[];
  }

  ngOnInit() {
    this._competitionService.listCompetitions().then(
      r=> {
        this.competitionsList=r;
      }
     );

    this._sportService.listActiveSports().subscribe(
      response => {
        this.sportsLists = response;
      }
    );

    this._countryService.listActiveCountries().subscribe(
      response => {
        this.countriesList = response;
      }
    );
  }


  filterCompetition() {
    let search: any;

    search = {
      name: { 'contains': this.filter },
      status: {'is': this.statusFilter},
      sport_id: {'is': this.sportFilter},
      country_id: {'is': this.countryFilter}
    }
    this._competitionService.advancedCompetitionsSearch(search).then(
      response => this.competitionsList = response
    );
  }


  enableEdition(id) {
    if (this.edition && this.edition == id)
      this.edition = null;
    else
      this.edition = id;
  }

  changeSport(sportId) {

    this.competition = this.competitionsList.find(o => o.id === this.edition);
    let newSport: Sport = this.sportsLists.find(o => o.id === sportId);
    let previousSport= this.competition.sport;
    this.competition.sport = newSport;

    this._competitionService.edit(this.competition).subscribe(
      response => {
        this.success = "Competición modificada con exito.";
        setTimeout(() => {
          this.success = null;
        }, 2500);
      },
      error => {
        this.competition.sport=previousSport;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 2500);
      }
    );
  }

  changeCountry(countryId) {
    //otra opcion
    //var pos = this.listaCompeticiones.findIndex(o => o.id === this.edicion);
    //this.listaCompeticiones[pos].pais = this.listaPaises.find(o => o.id === id);
    //this._competicionService.editar(this.listaCompeticiones[pos]).subscribe(

    this.competition = this.competitionsList.find(o => o.id === this.edition);
    let newCountry:Country=this.countriesList.find(o => o.id === countryId);
    let previousCountry= this.competition.country;
    this.competition.country = newCountry;

    this._competitionService.edit(this.competition).subscribe(
      response => {
        this.success = "Competición modificada con exito.";
        setTimeout(() => {
          this.success = null;
        }, 2500);
      },
      error => {
        this.competition.country=previousCountry;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 2500);
      }
    );
  }

  enableCompetition(id) {
    this.competition = this.competitionsList.find(o => o.id === id);
    let previousState=this.competition.status;
    this.competition.status = 1;

    this._competitionService.edit(this.competition).subscribe(
      response => {
        this.success = "Competición modificada con exito.";
        setTimeout(() => {
          this.success = null;
        }, 2500);
      },
      error => {
        this.competition.status=previousState;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 2500);
      }
    );
  }

  disableCompetition(id) {
    this.competition = this.competitionsList.find(o => o.id === id);
    let previousState=this.competition.status;
    this.competition.status = 0;

    this._competitionService.edit(this.competition).subscribe(
      response => {
        this.success = "Competición modificada con exito.";
        setTimeout(() => {
          this.success = null;
        }, 2500);
      },
      error => {
        this.competition.status=previousState;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 2500);

      }
    );
  }

  changeName(id) {
    var newName = $('#competitionEditable' + id).html();
    this.competition = this.competitionsList.find(o => o.id === id);
    let previousName= this.competition.name;
    this.competition.name = newName;

    this._competitionService.edit(this.competition).subscribe(
      response => {
        this.modifiedNameId = id;
        setTimeout(() => {
          this.modifiedNameId = null;
        }, 3000);
      },
      error => {
        this.competition.name=previousName;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 3000);

      }
    );

  }

  deleteCompetition(id) {
    this.competition = this.competitionsList.find(o => o.id === id);
    let pos = this.competitionsList.indexOf(this.competition);

    this._competitionService.delete(this.competition.id).subscribe(
      response => {
        this.success = "Competicion borrada.";
        this.competitionsList.splice(pos, 1);
        setTimeout(() => {
          this.success = null;
        }, 2000);
      }
    );

  }


  sortCompetition(key,mode){
    this.sort=[key,mode];
  }

  disableEnter(id) {
    $('#competitionEditable' + id).on("keypress", function (e) {
      var key = e.keyCode || e.charCode;  // ie||others
      if (key == 13) {

        $(this).blur();
      }

    });
  }



}