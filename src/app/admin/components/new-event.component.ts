import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../services/global';

import { Competition } from '../../models/competition';
import { Event } from '../../models/event';
import { Sport } from '../../models/sport';
import { Country } from '../../models/country';

import { UserService } from '../../services/user.service';
import { CompetitionService } from '../../services/competition.service';
import { EventService } from '../../services/event.service';
import { SportService } from '../../services/sport.service';
import { CountryService } from '../../services/country.service';

@Component({
    selector: 'new-event',
    templateUrl: '../views/new-event.html'
})

export class NewEventComponent implements OnInit{

    public event: Event;
    public identity;
    public error: string;
    public success:string;
    public competitionsList: Array<Competition>;
    public sportsList: Array<Sport>;
    public countriesList: Array<Country>;

    public filterBySport: string;
    public filterByCountry: string;
    //sin usar competitionFilter
    public competitionFilter:string;

    constructor(
        private _userService: UserService,
        private _competitionService: CompetitionService,
        private _eventService:EventService,
        private _sportService: SportService,
        private _countryService: CountryService
      ){
        this.event = new Event(null,"",null, new Competition(null, "",null, null,null, null, null),null,null);
        this.identity = this._userService.getIdentity();
        this.error=null;
        this.success=null;
        this.filterBySport = null;
        this.filterByCountry = null;

      }

    ngOnInit(){
        
        this._competitionService.listActiveCompetitions().then(
            response=>{
                this.competitionsList=response;
            },
            error=>{
              this.error=JSON.parse(error._body).message;
              this.success= null;   
              setTimeout(() => {
                  this.error=null;
              }, 3000);
          }
        );

        this._sportService.listActiveSports().subscribe(
            response => {
              this.sportsList = response;
            }
          );
      
          this._countryService.listActiveCountries().subscribe(
            response => {
              this.countriesList = response;
            }
          );

    }
    
    onSubmit(form){

        this._eventService.add(this.event).subscribe(
          response=>{        
             
              //this.evento = new Evento(null,"",null ,null, null);
            form.reset();
              this.success="Evento añadido correctamente.";
              //this.cargarListaCompeticiones();
             window.location.href = "/admin/events";
              setTimeout(() => {
                  this.success=null;
              },2000);
          },
          error=>{
              var body= JSON.parse(error._body);
              this.error=body['message'];
              setTimeout(() => {
                  this.error=null;
              },2500);
    
          } 
        )
      }


      //actualiza la lista de competiciones mostrada en el buscador 
  //en funcion del deporte y del pais seleccionados
  filterCompetitionsSearch() {
    
        let search: any;
    
        search = {
          status: { 'is': 1 },
          sport_id: { 'is': this.filterBySport },
          country_id: { 'is': this.filterByCountry }
        }
    
    
        this._competitionService.advancedCompetitionsSearch(search).then(
          response => this.competitionsList = response
    
        );
      }


}
  