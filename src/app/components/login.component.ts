import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { GLOBAL } from '../services/global';
import { User } from '../models/user';
import { UserService } from '../services/user.service';



@Component({
    selector: 'login',
    templateUrl: '../views/login.html',
    providers: [UserService]
})

export class LoginComponent implements OnInit{
    
    public user: User;
    public error: string;
    public identity;
    
    
    constructor(
        private _route: ActivatedRoute,
        private _router:Router,
        private _userService: UserService
    ){
        this.user = new User( null ,'','','','','', null);
    }

    ngOnInit(){
        this.identity= this._userService.getIdentity();
      }
    
    ngDoCheck(){
    this.identity = this._userService.getIdentity();
    }

    onSubmit(form){
        this._userService.login(this.user).subscribe(
            response=>{
                this.error=null;
                this.identity= response.identity;
                if (this.identity){
                    localStorage.setItem('identity', JSON.stringify(this.identity));
                    setTimeout(() => {
                        window.location.href = "/home";
                       // this._router.navigate(['/']);
                    }, 500); 
                }
            },
            error=>{
                let errorBody=JSON.parse(error._body);
                this.error=errorBody.message;
                this.identity=null;
                setTimeout(() => {
                    this.error=null;
                },3000);
            }
        );
        
    }




    



}