import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import {GLOBAL} from './global';
import {UserService} from './user.service';


@Injectable()
export class CountryService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    //permisos de administrador para ver?
    listCountries(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.get(this.url+'country/',{headers:headers}).map(res=>res.json());
    }

    listActiveCountries(){
        
        let search = {
          status: {'is': 1}
        }
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'country/advancedSearch/'+params,{headers:headers}).map(res=>res.json());

    }

    advancedCountriesSearch(search){
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'country/advancedSearch/'+params,{headers:headers}).map(res=>res.json());
    }



    add(country){
        let params = JSON.stringify(country);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'country/',params,{headers:headers}).map(res=>res.json());
    }

    saveImage(country,tempImage){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'country/country-image',{country,tempImage},{headers:headers}).map(res=>res.json());
    }

    deleteImage(country){
        let params = JSON.stringify(country);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.put(this.url+'country/country-image',country, {headers:headers}).map(res=>res.json());
    }

    delete(id){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.delete(this.url+'country/'+id, new RequestOptions({headers:headers})).map(res=>res.json());
    }
    edit(country){
        let params = JSON.stringify(country);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});

		return this._http.put(this.url+'country/', params, {headers: headers})
                         .map(res => res.json());
    }

    getById(id){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'country/'+id,{headers:headers}).map(res=>res.json());
    }

    
}