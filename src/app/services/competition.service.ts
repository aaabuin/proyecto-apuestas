import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import {GLOBAL} from './global';
import {UserService} from './user.service';
import {SportService} from './sport.service';
import {CountryService} from './country.service';

import { Sport } from '../models/sport';
import { Country } from '../models/country';
import { Competition } from '../models/competition';
declare var jQuery:any;
declare var $:any;

@Injectable()
export class CompetitionService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService,
        private _sportService: SportService,
        private _countryService: CountryService,
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    completeCompetition(competition){   
        return Promise.all([
            this._sportService.getById(competition.sportId).toPromise(),
            this._countryService.getById(competition.countryId).toPromise(),
            Promise.resolve(competition)
          ]).then(
            ([sport, country, competition]) => {

                let s=new Sport(null, "", "", null,null,null);
                let c=new Country(null, "", "", null,null,null);

                if(!jQuery.isEmptyObject(sport)){
                    s = new Sport(sport.id, sport.name, sport.image, sport.status,null,null);  
                }
                
                if(!jQuery.isEmptyObject(country)){
                    c = new Country(country.id, country.name, country.image, country.status,null,null);  
                }
              
                if(jQuery.isEmptyObject(competition)){
                    return null;
                }
              return new Competition(competition.id, competition.name, competition.status, c, s, competition.userId, competition.createdAt);
            }
            )
    }

    completeCompetitionList(competitionList){
        return competitionList.toPromise().then(
            competitions =>
            Promise.all(competitions.map(competition => {
                
              return this.completeCompetition(competition);
            }
            )).then(
              fullCompetition => {
                  return fullCompetition
                  ;
              }
              )
          )
    }


    getById(id){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'competition/'+id,{headers:headers}).map(res=>res.json());
    }

    
    //devuelve una lista de competiciones con la información completa
    listCompetitions(){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        
        return this.completeCompetitionList(this._http.get(this.url+'competition/',{headers:headers}).map(res=>res.json()));
    }

    advancedCompetitionsSearch(key){

        let params = JSON.stringify(key);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completeCompetitionList(this._http.get(this.url+'competition/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));
    }

    listActiveCompetitions(){

        let search = {
            status: {'is': 1}
        }
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this.completeCompetitionList(this._http.get(this.url+'competition/advancedSearch/'+params,{headers:headers}).map(res=>res.json()));
    }

    add(competition){
        let params = JSON.stringify(competition);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'competition/',params,{headers:headers}).map(res=>res.json());
    }

    delete(id){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.delete(this.url+'competition/'+id, new RequestOptions({headers:headers})).map(res=>res.json());
    }
    
    edit(competition){
        let params = JSON.stringify(competition);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
		return this._http.put(this.url+'competition/', params, {headers: headers})
                         .map(res => res.json());
    }

    
}