import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';



@Component({
    selector: 'recover-password',
    templateUrl: '../views/recover-password.html',
    providers: [UserService]
})

export class RecoverPasswordComponent{

    public username:string;
    public email:string;
    public search:string;
    public error: string;
    public success:string;
    
    constructor(
        private _userService: UserService
    ){
        
    }


    onSubmit(form){
 
        var emailRegEx = RegExp('^[a-zA-Z0-9]+[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+[.][a-zA-Z]{2,5}$');

        if (emailRegEx.test(this.search)){
            this.email=this.search;
            this.username=null;
        }else{
            this.email=null;
            this.username=this.search;
        }

        this._userService.recoverPass(this.username, this.email).subscribe(
            response=>{
                this.error=null;
                this.success= "Se ha enviado un correo con la nueva contraseña";  
                form.reset();
                setTimeout(() => {
                    this.success=null;
                }, 3000);

            },
            error=>{
                
                this.error=JSON.parse(error._body).message;
                this.success= null;   
                setTimeout(() => {
                    this.error=null;
                }, 3000);
            }
        );
        
    }
}