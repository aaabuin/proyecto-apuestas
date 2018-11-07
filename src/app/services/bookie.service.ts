import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { UserService } from './user.service';

@Injectable()
export class BookieService{
    public url: string;
    public token;

    constructor(
        private _http: Http, 
        private _userService: UserService
    ){
        this.url= GLOBAL.url;
        this.token = this._userService.getToken();
    }

    listBookies(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.get(this.url+'bookie/',{headers:headers}).map(res=>res.json());
    }

    listActiveBookies(){
        let search = {
            status: {'is': 1}
            }
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'bookie/advancedSearch/'+params,{headers:headers}).map(res=>res.json());
    }

    advancedBookiesSearch(search){
        let params = JSON.stringify(search);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'bookie/advancedSearch/'+params,{headers:headers}).map(res=>res.json());
    }

    getById(id){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.get(this.url+'bookie/'+id,{headers:headers}).map(res=>res.json());
    }

    add(bookie){
        let params = JSON.stringify(bookie);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'bookie/',params,{headers:headers}).map(res=>res.json());
    }

    saveImage(bookie,tempImage){
        //let params = JSON.stringify(bookie,imagenTemporal);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.post(this.url+'bookie/bookie-image',{bookie,tempImage},{headers:headers}).map(res=>res.json());
    }

    deleteImage(bookie){
        let params = JSON.stringify(bookie);
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.put(this.url+'bookie/bookie-image',bookie, {headers:headers}).map(res=>res.json());
    }

    delete(id){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
        return this._http.delete(this.url+'bookie/'+id, new RequestOptions({headers:headers})).map(res=>res.json());
    }
    edit(bookie){
        let params = JSON.stringify(bookie);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.token
		});
		return this._http.put(this.url+'bookie/', params, {headers: headers})
                         .map(res => res.json());
    }
    
}