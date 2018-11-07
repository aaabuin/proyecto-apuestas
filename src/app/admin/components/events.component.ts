import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
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

declare var jQuery: any;
declare var $: any;

/*
to do:
repasar todos los ngValue de los html
revisar que variables necesitan ser inicializadas
linea html select competiciones edicion-ok=> deberia probar el [ngModel]="event.competicion.id"si me modifica el elemento de una lista
revisar permisos admin-user
revisar seccion User en general(backend incluido)
puntos y comas? xD
*/

@Component({
  selector: 'events',
  templateUrl: '../views/events.html'
})

export class EventsComponent implements OnInit {

  public event: Event;
  public identity;
  public error: string;
  public success: string;
  public eventList: Array<Event>;
  public url: string;

  //listas para edicion de la competición de cada evento
  public competitionsList: Array<Competition>;
  public sportsList: Array<Sport>;
  public countriesList: Array<Country>;

  //filtros para la busqueda/lista de eventos
  public nameFilter: string;
  public dateTime: string;
  public dateFilter: string;
  public filterBySport: string;
  public filterByCountry: string;
  public competitionFilter: string;
  public competitionsFilterList: Array<Competition>;

  //array para ordenar
  public sort: Array<String>;


  //nos indica el nombre del evento que ha sido modificado con exito(sirve para mostrar un tik de confirmación)
  public modifiedNameId: number;
  //marca que evento se está editando, nulo si non se está editando ninguno
  public editionId: number;
  //nos indica que fecha se está editando
  public editDateId: number;
  //filtros para la edicion de la competicion de cada evento
  public sportFilter: number;
  public countryFilter: number;


  constructor(
    private _userService: UserService,
    private _competitionService: CompetitionService,
    private _eventService: EventService,
    private _sportService: SportService,
    private _countryService: CountryService

  ) {
    this.event = new Event(null, "", null, new Competition(null, "", null, null, null, null, null),null,null);
    this.identity = this._userService.getIdentity();
    this.error = null;
    this.success = null;
    this.url = GLOBAL.url;
    this.editDateId = null;
    this.modifiedNameId = null;
    this.editionId = null
    this.sportFilter = null;
    this.countryFilter = null;
    this.nameFilter = null;
    this.dateTime = null;
    this.dateFilter = null;
    this.competitionFilter = null;
    this.filterBySport = null;
    this.filterByCountry = null;

    this.sort = ["", ""];
  }

  ngOnInit() {
    this.loadEventList();
    

    this._competitionService.listActiveCompetitions().then(
      response => {
        this.competitionsList = response;
        this.competitionsFilterList = response;
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

  loadEventList() {
    //let lista: Array<any> = [];
    // let listaCompeticiones: Array<Competicion> = [];

    this._eventService.listEvents().then(
      response =>{
        this.eventList = response;
      } 
      )
  }


  changeDate(id) {
    if (id == 0)
      this.editDateId = null;
    else {
      this.editDateId = id;
      this.event = this.eventList.find(o => o.id === this.editDateId);
      let pos = this.eventList.indexOf(this.event);
    }
  }

  saveDate() {

    let pos = this.eventList.indexOf(this.eventList.find(o => o.id === this.editDateId));


    this._eventService.edit(this.event).subscribe(
      response => {
        //this.evento = new Evento(null,"",null, null, null);
        //this.cargarListaEventos();
        this.success = "Evento modificado con exito.";
        this.eventList[pos] = this.event;
        this.editDateId = null;
        setTimeout(() => {
          this.success = null;
        }, 3000);
      },
      error => {
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 3000);

      }
    );
  }




  changeName(id) {
    let newName = $('#eventEditable' + id).html();
    this.event = this.eventList.find(o => o.id === id);
    let previousName= this.event.name;
    this.event.name = newName;

    this._eventService.edit(this.event).subscribe(
      response => {
        this.modifiedNameId = id;
        setTimeout(() => {
          this.modifiedNameId = null;
        }, 3000);
      },
      error => {
        this.event.name=previousName;
        var body = JSON.parse(error._body);
        this.error = body['message'];
        setTimeout(() => {
          this.error = null;
        }, 3000);

      }
    );

  }

  disableEnter(id) {
    $('#eventEditable' + id).on("keypress", function (e) {
      var key = e.keyCode || e.charCode;  // ie||others
      if (key == 13) {
        $(this).blur();
      }

    });
  }

  /* Habilita/deshabilita la edición de la competicion con el id recibido
  si el id recibido es igual al guardado en la variable edicionId, lo ponemos a null deshabilitando la edicion,
  en caso contrario cargamos el evento de listaEventos y habilitamos la edicion asignando el id a edicionId */
  editCompetition(id) {
    this.sportFilter = null;
    this.countryFilter = null;
    this.filterCompetitions();

    if (this.editionId == id) this.editionId = null;
    else {
      this.event = this.eventList.find(o => o.id === id);
      this.editionId = id;
    }

  }


//modifica la competicion del evento en la bd
  changeCompetition(competitionId) {

    this.event= this.eventList.find(o => o.id === this.editionId);
    let previousCompetition:Competition= this.event.competition;

    //let pos = this.listaEventos.indexOf(this.evento);
    this._competitionService.getById(competitionId).toPromise().then(
      competi => this._competitionService.completeCompetition(competi)).then(
      c => {
        this.event.competition = c;
        this._eventService.edit(this.event).subscribe(
          response => {
            this.success = "Evento modificado con exito.";
            this.editionId = null;
            setTimeout(() => {
              this.success = null;
            }, 3000);
            //this.listaEventos[pos] = this.evento;
          },
          error => {
            this.event.competition = previousCompetition;
            var body = JSON.parse(error._body);
            this.error = body['message'];
            setTimeout(() => {
              this.error = null;
            }, 3000);

          }
        );
      }
      )
  }


  //actualiza la lista de eventos mostrada, filtrandolos en funcion del nombre,de la competicion y la fecha seleccionadas.
  filterEvents() {

    let search = {};
    let lista: Array<any> = [];

    search = {
      name: { 'contains': this.nameFilter },
      competition_id: { 'is': this.competitionFilter }
    }

    if ((!this.dateTime || this.dateTime == "now")&&this.dateFilter!="")
    search = $.extend(search, { date: { 'is date': this.dateFilter } });
    if (this.dateTime == "before")
    search = $.extend(search, { date: { 'before date': this.dateFilter } });
    if (this.dateTime == "after")
    search = $.extend(search, { date: { 'after date': this.dateFilter } });




    this._eventService.advancedEventsSearch(search).then(
      response => this.eventList = response
      )
  }


  //actualiza la lista de competiciones mostrada en el buscador 
  //en funcion del deporte y del pais seleccionados
  competitionsFilterSearch() {

    let search: any;

    search = {
      status: { 'is': 1 },
      sport_id: { 'is': this.filterBySport },
      country_id: { 'is': this.filterByCountry }
    }


    this._competitionService.advancedCompetitionsSearch(search).then(
      response => this.competitionsFilterList = response

    );
  }


    //actualiza la lista de competiciones mostrada al editar un evento en concreto
  //la lista se actualiza en funcion del deporte y del pais seleccionados
  filterCompetitions() {

    let search: any;

    search = {
      status: { 'is': 1 },
      sport_id: { 'is': this.sportFilter },
      country_id: { 'is': this.countryFilter }
    }


    this._competitionService.advancedCompetitionsSearch(search).then(
      response => this.competitionsList = response

    );
  }

  sortEvents(key, mode) {
    this.sort = [key, mode];
  }


  deleteEvent(id) {
    this.event = this.eventList.find(o => o.id === id);
    let pos = this.eventList.indexOf(this.event);

    this._eventService.delete(this.event.id).subscribe(
      response => {
        this.success = "Evento borrado.";
        this.eventList.splice(pos, 1);
        setTimeout(() => {
          this.success = null;
        }, 2000);
      }
    );

  }



}
