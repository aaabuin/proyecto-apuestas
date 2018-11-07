import { Component, DoCheck, OnInit, Output, EventEmitter } from '@angular/core';

import { Sport } from '../models/sport';
import { Competition } from '../models/competition';
import { Country } from '../models/country';
import { Event } from '../models/event';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { SportService } from '../services/sport.service';
import { CompetitionService } from '../services/competition.service';
import { CountryService } from '../services/country.service';
import { EventService } from '../services/event.service';
import { BetService } from '../services/bet.service';

declare var jQuery: any;
declare var $: any;

@Component({
    selector: 'select-event',
    templateUrl: '../views/select-event.html'
})


export class SelectEventComponent implements OnInit {
    public sport: Sport;
    public country: Country;
    public competition: Competition;
    public event: Event;
    public newEvent: Event;

    public identity;
    public success: string;
    public error: string;
    public url: string;

    public sportsList: Array<Sport>;
    public sportFilter: string;

    public countriesList: Array<Country>;
    public countryFilter: string;

    public competitionsList: Array<Competition>;
    public competitionFilter: string;

    public eventsList: Array<Event>; 
    public eventFilter: string;

    //declaramos las variables para la paginacion
    itemsSportPaginate: number = 5;
    itemsCountryPaginate: number = 5;
    itemsCompetiPaginate: number = 10;
    itemsEventPaginate: number = 10;

    /*SUBSTITUIR VARIABLES DE PAGINACION POR ARRAY???????????????????????????????????????????????????
    itemsPaginacion =[
        ["deportes" ,5 ],
        ["paises" ,5 ]
    ];
    */

    @Output() selectedEvent = new EventEmitter();


    constructor(
        private _userService: UserService,
        private _sportService: SportService,
        private _countryService: CountryService,
        private _eventService: EventService,
        private _betService: BetService,
        private _competitionService: CompetitionService
    ) {
        this.sport = new Sport(null, "", "", null, null, null);
        this.country = new Country(null, "", "", null, null, null);
        this.competition = new Competition(null, "", null, null, null, null, null);
        this.event = new Event(null, "", "", null, null, null);
        this.newEvent = new Event(null, "", null, null, null, null);



        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.success = null;
        this.sportsList = [];
        this.countriesList = [];
        this.competitionsList = [];
        this.eventsList = [];

        this.sportFilter = "";
        this.countryFilter = "";
        this.competitionFilter = "";
        this.eventFilter = "";

    }

    ngOnInit() {
        this.filterSports();

        this.filterCompetitions();

        this.filterCountries();

        /* LISTAR EVENTOS EN GENERAL?? */

        this.newEvent.date = this.currentDate();

    }


    cleanSportFilter() {
        this.sportFilter = "";
        this.itemsSportPaginate = 5;
        this.sport = new Sport(null, "", "", null, null, null);
        //this.pronostico.evento=null;
        this.filterSports();
        this.filterCompetitions();
    }

    cleanCountryFilter() {
        this.countryFilter = "";
        this.itemsCountryPaginate = 5;
        this.country = new Country(null, "", "", null, null, null);
        //this.evento=null;
        this.filterCountries();
        this.filterCompetitions();
    }


    cleanCompetitionFilter(key = null) {

        if (key && key == 'c') {
            this.country = new Country(null, "", "", null, null, null);

        } else if (key && key == 's') {
            this.sport = new Sport(null, "", "", null, null, null);

        } else {
            this.competitionFilter = "";
            this.itemsCompetiPaginate = 10;
            this.competition = new Competition(null, "", null, null, null, null, null);
            this.sport = new Sport(null, "", "", null, null, null);
            this.country = new Country(null, "", "", null, null, null);
        }

        this.filterCompetitions();
        this.filterEvents();
    }

    cleanEventFilter(key = null) {

        if (key == null) {
            this.eventFilter = "";
            this.event = new Event(null, "", "", null, null, null);
            this.competition = new Competition(null, "", null, null, null, null, null);
            this.country = new Country(null, "", null, null, null, null);
            this.sport = new Sport(null, "", "", null, null, null);
        }
        if (key == 'c') {
            this.competition = new Competition(null, "", null, null, null, null, null);
        }

        this.itemsEventPaginate = 10;
        this.filterCompetitions();
        this.filterEvents();

    }


    filterSports() {
        let search = {
            name: { 'contains': this.sportFilter },
            status: { 'is': 1 },
            "OR": {
                status: { 'is': 2 },
                name: { 'contains': this.sportFilter },
                user_id: { 'is': this.identity.id },
            },
            "ORDER BY": { user_id: "DESC" }
        }
        this._sportService.advancedSportsSearch(search).subscribe(
            response => this.sportsList = response
        );


    }


    filterCountries() {

        let search = {
            name: { 'contains': this.countryFilter },
            status: { 'is': 1 },
            "OR": {
                status: { 'is': 2 },
                name: { 'contains': this.countryFilter },
                user_id: { 'is': this.identity.id },
            },
            "ORDER BY": { user_id: "DESC" }
        }

        this._countryService.advancedCountriesSearch(search).subscribe(
            response => this.countriesList = response
        );
    }



    filterCompetitions() {
        let search: any;

        search = {
            name: { 'contains': this.competitionFilter },
            sport_id: { 'is': this.sport.id },
            country_id: { 'is': this.country.id },
            status: { 'is': 1 },
            "OR": {
                status: { 'is': 2 },
                user_id: { 'is': this.identity.id },
                name: { 'contains': this.competitionFilter },
                sport_id: { 'is': this.sport.id },
                country_id: { 'is': this.country.id }
            },
            "ORDER BY": { user_id: "DESC" }
        }

        this._competitionService.advancedCompetitionsSearch(search).then(
            response => {
                this.competitionsList = response;
                this.orderFavCompetitions();

            }
        )
    }


    /*/ El nombre recibido=null, actua en el caso de que se introduzca un nuevo evento.*/
    filterEvents() {

        let date = new Date();

        let search = {
            name: { 'contains': this.eventFilter },
            competition_id: { 'is': this.competition.id },
            date: { 'after date': date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() },
            "ORDER BY": { date: "ASC" }
        }

        this._eventService.advancedEventsSearch(search).then(
            response => this.eventsList = response,
            error => {
                this.error = JSON.parse(error._body).message;
                this.success = null;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            }
        )
    }



    assignSport(sportId) {
        this.sport = this.sportsList.find(o => o.id === sportId);
        //this.competicionSeleccionada=null;
        this.filterCompetitions();

    }

    assignCountry(countryId) {
        this.country = this.countriesList.find(o => o.id === countryId);
        //this.competicion=null;
        this.filterCompetitions();
    }


    assignCompetition(competitionId) {

        this.competition = this.competitionsList.find(o => o.id === competitionId);

        this.country = this.competition.country;
        this.sport = this.competition.sport;
        this.filterCompetitions();
        this.filterEvents();
    }



    assignEvent(eventId) {

        this.event = this.eventsList.find(o => o.id === eventId);
        //deberiamos darle valor a los filtros para que salga la lista con nuestra competi incluida
        this.competition = this.event.competition;
        this.sport = this.event.competition.sport;
        this.country = this.event.competition.country;

        this.filterCompetitions();
        this.filterEvents();
        //this.asignarCompeticion(this.evento.competicion.id);
        this.emitEvent();
    }

    /*
        Permite al usuario añadir un deporte que no se encuentre en la lsita.
        No permite guardar imagenes asociadas.
        el estado del deporte guardado será 2 (pendiente de validacion/privado)
        Tras guardar el deporte se le asocia el id devuelto por el backend,
        se añade a la lista de deportes existente y se ordena la misma
        dando prioridad a los deportes añadidos por el usuario actual.
        Se actualizan las listas de deportes y competiciones.
        No se borra el objeto deporte porque se usará como filtro para mostrar el listado de competiciones.
    */
    saveSport() {
        this.sport.status = 2;
        this.sport.image = "";
        this.sport.createdAt = null;
        this._sportService.add(this.sport).subscribe(
            response => {
                this.sport.id = response;
                this.success = "Deporte guardado correctamente.";
                this.sportsList.push(this.sport);
                this.filterSports();
                this.filterCompetitions();

                setTimeout(() => {
                    this.success = null;
                }, 3000);
            },
            error => {
                this.error = JSON.parse(error._body).message;
                this.success = null;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            })
    }


    /*
    Permite al usuario añadir un pais que no se encuentre en la lista.
    No permite guardar imagenes asociadas.
    el estado del pais guardado será 2 (pendiente de validacion/privado)
    Tras guardar el pais se le asocia el id devuelto por el backend,
    se añade a la lista de paises existente y se ordena la misma
    dando prioridad a los paises añadidos por el usuario actual.
    Se actualiza el listado de paises y competiciones.
    No se borra el objeto pais porque se usa como filtro para mostrar el listado de competiciones.
*/
    saveCountry() {
        this.country.status = 2;
        this.country.image = "";
        this.country.createdAt = null;
        this._countryService.add(this.country).subscribe(
            response => {
                this.country.id = response;
                this.success = "Pais guardado correctamente.";
                this.countriesList.push(this.country);
                this.filterCountries();
                this.filterCompetitions();
                setTimeout(() => {
                    this.success = null;
                }, 3000);
            },
            error => {
                this.error = JSON.parse(error._body).message;
                this.success = null;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            })
    }


    /*
        Permite al usuario añadir una competicion que no se encuentre en la lista.
        No permite guardar imagenes asociadas.
        el estado de la competicion guardado será 2 (pendiente de validacion/privado)
        Tras guardar el competicion se le asocia el id devuelto por el backend,
        se añade a la lista de competiciones existente y se ordena la misma
        dando prioridad a las competiciones añadidos por el usuario actual.
        Se actualizan las listas de competiciones y eventos.
        No se borra el objeto competicion porque se usará como filtro para mostrar el listado de eventos.
    */
    saveCompetition() {
        this.competition.sport = this.sport;
        this.competition.country = this.country;
        this.competition.status = 2;
        this.competition.createdAt = null;
        this._competitionService.add(this.competition).subscribe(
            response => {
                this.competition.id = response;
                this.success = "Competicion guardada correctamente.";
                this.competitionsList.push(this.competition);
                this.filterCompetitions();
                this.filterEvents();
                setTimeout(() => {
                    this.success = null;
                }, 3000);
            },
            error => {
                this.error = JSON.parse(error._body).message;
                this.success = null;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            })
    }



    /*
    Permite al usuario añadir un evento que no se encuentre en la lista.
    Debe seleccionarse antes un deporte y un país.
    Debe asignarsele nombre al evento y una fecha posterior a la actual.
    Tras guardar el evento se le asocia el id devuelto por el backend,
    se añade a la lista de eventos existente y se ordena la misma
    dando prioridad a los eventos añadidos por el usuario actual.
    Se borra el objeto nuevoEvento usado para insertarlo en la bd para vaciar el 
    formulario de insercion.
*/
    saveEvent() {
        this.newEvent.competition = this.competition;
        //FALTA COMPROBAR COMPETI********************************
        if (this.newEvent.name == "") {
            this.error = "Debe introducir el evento.";
            setTimeout(() => {
                this.error = null;
            }, 3000);
        }
        else if (new Date(this.newEvent.date) <= new Date()) {
            this.error = "La fecha y hora introducidas deben ser posteriores a las actuales.";
            setTimeout(() => {
                this.error = null;
            }, 3000);
        }
        else {
            this._eventService.add(this.newEvent).subscribe(
                response => {
                    this.newEvent.id = response;
                    this.success = "Evento guardado correctamente.";
                    this.eventsList.push(this.newEvent);
                    //actualizamos el evento para poder emitirlo con output emitirEvento()
                    this.event = this.newEvent;
                    this.filterEvents();
                    this.emitEvent();
                    this.newEvent = new Event(null, null, this.currentDate(), null, null, null);

                    setTimeout(() => {
                        this.success = null;
                    }, 3000);
                },
                error => {
                    this.error = JSON.parse(error._body).message;
                    this.success = null;
                    setTimeout(() => {
                        this.error = null;
                    }, 3000);
                }
            );
        }
    }

    showMoreSports() {
        this.itemsSportPaginate += 5;
    }

    showMoreCountries() {
        this.itemsCountryPaginate += 5;
    }

    showMoreCompetitions() {
        this.itemsCompetiPaginate += 10;
    }

    showMoreEvents() {
        this.itemsEventPaginate += 10;
    }

    currentDate() {
        let date = new Date();
        let d;
        d = date.getFullYear() + '-';

        if (date.getMonth() < 9)
            d += "0";
        d += (date.getMonth() + 1) + '-';

        if (date.getDate() < 10)
            d += "0";
        d += date.getDate() + "T";

        if (date.getHours() < 10)
            d += "0";
        d += date.getHours() + ":00";
        return d;
    }

    emitEvent() {
        /* * CAMBIAR POR EVENTO *******************************/
        this.selectedEvent.emit({ event: this.event });
    }

    scrollToAnchor(aid) {
        var aTag = $("div [name='" + aid + "']");
        $('html,body').animate({ scrollTop: aTag.offset().top }, 'slow');
    }


    orderFavCompetitions() {
        let finalList: Array<any> = [];
        this._betService.favCompetitionsList(this.identity.id).toPromise().then(
            competisList => {
                for (var i = 0, max = competisList.length; i < max; i += 1) {
                    let pos = this.competitionsList.findIndex(competi => competi.id === competisList[i].competition_id);
                    if (pos >= 0)
                        finalList = finalList.concat(this.competitionsList.splice(pos, 1));
                }
                this.competitionsList = finalList.concat(this.competitionsList);
            }
        ).catch(
            error=>console.log(error)
        )
    }
} 