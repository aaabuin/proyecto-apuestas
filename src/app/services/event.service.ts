import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import {GLOBAL} from './global';

import {CompetitionService} from './competition.service';
import {UserService} from './user.service';

import { Competition } from '../models/competition';
import { Event } from '../models/event';

declare var jQuery:any;
declare var $:any;


@Injectable()
export class EventService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService,
        private _competitionService: CompetitionService
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    listEvents(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this.completeEventList(this._http.get(this.url+'event/',{headers:headers}).map(res=>res.json()));
    }

    add(event){
        let params = JSON.stringify(event);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'event/',params,{headers:headers}).map(res=>res.json());
    }

    getById(id){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'event/'+id,{headers:headers}).map(res=>res.json());
    }

    delete(id){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.delete(this.url+'event/'+id, new RequestOptions({headers:headers})).map(res=>res.json());
    }
    edit(event){
        let params = JSON.stringify(event);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
		return this._http.put(this.url+'event/', params, {headers: headers})
                         .map(res => res.json());
    }


    //REVISAR SU USO/*/*///*///
    /*
    buscarEventos(clave){
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completarListaEventos(this._http.get(this.url+'eventos/busqueda/'+clave,{headers:headers}).map(res=>res.json()));
    }*/

    
    advancedEventsSearch(key){
        let params = JSON.stringify(key);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completeEventList(this._http.get(this.url+'event/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));   
    }
    
    completeEvent(event){
        return this._competitionService.getById(event.competitionId).toPromise().then(
            c=>{
                return this._competitionService.completeCompetition(c);
            }
        ).then(
            fullCompetition=>{
                return new Event(event.id, event.name,event.date, fullCompetition, event.userId, event.createdAt);
            }
        )
/*
        return Promise.all([
            this._competicionService.getById(evento.competicion_id).toPromise(),
            Promise.resolve(evento)
          ]).then(
            ([competicion, evento]) => {
 
             return this._competicionService.completarCompeticion(competicion)
               
            }
            )
            .then(
                c =>{
                    if(jQuery.isEmptyObject(c)){
                        return null;
                    }
                return new Evento(evento.id, evento.nombre, evento.fecha,  c,evento.user_id ,evento.createdAt)
            }
            )*/
           
    }

    completeEventList(eventList){

        return eventList.toPromise().then(events =>
            Promise.all(events.map(event => {
              return this.completeEvent(event);
            }
            )).then(
              fullEvent => {
                  return fullEvent;
              }
            )
        )
    }

    
}