import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../models/user';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';




@Component({
    selector: 'register',
    templateUrl: '../views/register.html',
    providers: [UserService]
})

export class RegisterComponent implements OnInit{

    public user: User;
    public success: string;
    public error: string;
    public usernameError: boolean;
    public passwordToConfirm:string;

    
    constructor(
        private _route: ActivatedRoute,
        private _router:Router,
        private _userService: UserService 
    ){
        this.user = new User( null ,'','','','','', null);
    }

    ngOnInit(){
        if(this._userService.getIdentity()){
            this._userService.checkToken().subscribe(
                reponse=>this._router.navigate(['/home']),
                error=>localStorage.clear()
            )
        }
    }

    onSubmit(form){
        this._userService.register(this.user).subscribe(
            response=>{
                this.success="Registro completado correctamente.";
                form.reset();
                setTimeout(() => {
                    this.success=null;
                },3000);
            },
            error=>{
                this.success=null;
                var body= JSON.parse(error._body);
                this.error=body['message'];
                setTimeout(() => {
                    this.error=null;
                },3000);
            }
        );
    }

    

    checkUsername(){
        this._userService.checkUsername(this.user.username).subscribe(
                response=>{
                    this.usernameError=false;
                },
                error=>{
                    this.usernameError=true;
                }
            )
    }


}