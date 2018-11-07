import { Component,DoCheck, OnInit } from '@angular/core';
import { UserService} from '../services/user.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../models/user';
import { GLOBAL } from '../services/global';


@Component({
    selector:'app-header',
    templateUrl:'../views/header.html',
    providers: [ UserService]
})


export class HeaderComponent implements OnInit{
 public identity;
// public user: User;
 public error: string;
 public url: string;
 public forgot:boolean;

  constructor(
    private _route: ActivatedRoute,
    private _userService:UserService,
    private _router:Router
  ){
  //  this.user = new User( null ,'','','','','', null);
    this.url= GLOBAL.url;
    this.forgot=false;
  }

  ngOnInit(){
    this.identity= this._userService.getIdentity();
    //this.user= this._userService.getMyUser();
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
  }

  logout(){
    this.identity=null;
    localStorage.clear();
    this._router.navigate(['/home']);
  }

  forgotPassword(){
    this.forgot=!this.forgot;
  }

}
