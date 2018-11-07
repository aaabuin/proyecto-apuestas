import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import {GLOBAL} from './global';
import {UserService} from './user.service';


@Injectable()
export class SportService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    //devuelve el deporte con el id indicado
    getById(id){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'sport/'+id,{headers:headers}).map(res=>res.json());
    }


    listSports(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.get(this.url+'sport/',{headers:headers}).map(res=>res.json());
    }

    listActiveSports(){
        let search = {
            status: {'is': 1}
        }
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'sport/advancedSearch/'+params,{headers:headers}).map(res=>res.json());
    }

    advancedSportsSearch(search){
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'sport/advancedSearch/'+params,{headers:headers}).map(res=>res.json());
    }

    add(sport){
        let params = JSON.stringify(sport);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'sport/',params,{headers:headers}).map(res=>res.json());
    }

    saveImage(sport,tempImage){
        //let params = JSON.stringify(deporte,imagenTemporal);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'sport/sport-image',{sport,tempImage},{headers:headers}).map(res=>res.json());
    }

    deleteImage(sport){
        let params = JSON.stringify(sport);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.put(this.url+'sport/sport-image',sport, {headers:headers}).map(res=>res.json());
    }

    delete(id){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.delete(this.url+'sport/'+id, new RequestOptions({headers:headers})).map(res=>res.json());
    }
    edit(sport){
        let params = JSON.stringify(sport);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
		return this._http.put(this.url+'sport/', params, {headers: headers})
                         .map(res => res.json());
    }
    
}