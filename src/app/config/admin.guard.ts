import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class AdminGuard implements CanActivate{
	

	constructor(
		private _router: Router,
		private _userService: UserService	
	){

	}

	canActivate(){

		let identity = this._userService.getIdentity();

		if(identity && identity.token && identity.role==5){
			this._userService.checkToken().subscribe(
				response=>{
					return true;
					//esto no hace nada
					//console.log("response:"+JSON.stringify(response));
					//return false;
				},
				error=>{
					console.log("error: No puedes estar aqui");
					localStorage.clear();
					this._router.navigate(['/']);
					//no se llega a ejecutar el return false
					return false;
				}
			);
			return true;
		}else{
			console.log("Error: No puedes estar aqui");
			this._router.navigate(['/']);
			return false;
		}
	}

	//canActivate original
	/*
		canActivate(){
		let identity = this._userService.getIdentity();

		if(identity && identity.token){
			return true;
		}else{
			this._router.navigate(['/']);
			return false;
		}
	}
	*/
}