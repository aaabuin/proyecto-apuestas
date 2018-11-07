import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable} from 'rxjs/Observable';
import { GLOBAL} from './global';



@Injectable()
export class UserService{
    public url: string;
    public token;
    public identity;

    constructor(private _http: Http){
        this.url= GLOBAL.url;

    }


    /*
        Recibe un objeto usuario
        Devuelve el id del usuario insertado o error en su caso
        no es necesario estar logueado previamente
    */
    register(user){
        let params = JSON.stringify(user);
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.post(this.url+'user/',params,{headers:headers}).map(res=>res.json());
     }


     /**Comprueba las credenciales de un usuario,
      * devuelve identity si todo está ok
      no es necesario estar logueado previamente
      */
    login(user){
        let headers = new Headers({'Content-Type':'application/json',
        'password':user.password
        }); 

        return this._http.get(this.url+'user/token/'+user.username,{headers:headers}).map(res=>res.json());
     }


   /*DEVUELVE UN USUARIO EN FUNCION DE SU ID
   si no lo encuentra devuelve error
   no es necesario estar logueado previamente
*/
    getUserById(id){
        let headers = new Headers({
            'Content-Type': 'application/json'
        });

        return this._http.get(this.url+'user/'+id, {headers: headers})
                        .map(res => res.json());
    }


/*
     Devuelve un objeto usuario, correspondiente al token enviado
*/
     getMyUser(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.getToken()
		});

		return this._http.get(this.url+'user/', {headers: headers})
                         .map(res => res.json());
     }


     /*
      * Modifica el usuario logueado
      * devuelve true/false
      */
     updateMyUser(user_to_update){
        
        let params = JSON.stringify(user_to_update);
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.getToken()
		});

		return this._http.put(this.url+'user/', params, {headers: headers})
                         .map(res => res.json());
    }
    

    /*
    * Envia un objeto con dos contraseñas
    tambien se envia el token, en el backend se carga el usuario correspondiente al token
    Se devuelve true/false
    */
    updateMyPassword(oldPassword, newPassword){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.getToken()
		});

		return this._http.put(this.url+'user/password', { oldPass:oldPassword,newPass:newPassword}, {headers: headers})
                         .map(res => res.json());
    }

    deleteAvatar(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.getToken()
		});

		return this._http.delete(this.url+'user/user-image', {headers: headers})
                         .map(res => res.json());
    }
    

    /*
    Comprueba si un nombre de usuario enviado esta en uso o no
    devuelve true si está libre
    no es necesario estar logueado previamente
    */
    checkUsername(username){
        return this._http.get(this.url+'user/username/'+username).map(res=>res.json());
     }


     /*
     Devuelve el token contenido en el objeto identity guardado en localstorage
     */
     getToken(){
         let identity = JSON.parse(localStorage.getItem('identity'));
         if (identity && identity.token !="undefined"){
             return identity.token;
         }else{
             return null;
         }
     }

     /*
     Devuelve el objeto identity guardado en localstorage
     */
     getIdentity(){
        let identity =JSON.parse(localStorage.getItem('identity'));
        if (identity!="undefined"){
            this.identity=identity;
        }else{
            this.identity=null;
        }
        return this.identity;
     }


     /*
     Envia un token al backend, se comprueba su validez
     se devuelve true/false 
     */
     checkToken(){
        let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this.getToken()
        });
        
		return this._http.get(this.url+'user/valid-token', {headers: headers})
                         .map(res => res.json());
     }


     
     /*
     Se envia un nombre de usuario o un email
     se reestablece la contraseña
***************************** CREAR UN METODO PARA RECUPERARLA POR EMAIL Y OTRO PARA RECUPERARLA POR USERNAME ?? *************************************
     se devuelve true/false
     no es necesario estar logueado previamente
     */
     recoverPass(username, email){
        let headers = new Headers({'Content-Type':'application/json'});
        return this._http.post(this.url+'user/password',{username:username,email:email},{headers:headers}).map(res=>res.json());
     }

}