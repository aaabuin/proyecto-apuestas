import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class UserGuard implements CanActivate{
	

	constructor(
		private _router: Router,
		private _userService: UserService	
	){

	}

	canActivate(){

		let identity = this._userService.getIdentity();

		if(identity && identity.token){
			this._userService.checkToken().subscribe(
				response=>{
					//esto no hace nada
					console.log("response:"+JSON.stringify(response));
					return false;
				},
				error=>{
					console.log("error:"+JSON.stringify(error));
					localStorage.clear();
					this._router.navigate(['/']);
					//no se llega a ejecutar el return false
					return false;
				}
			);
			return true;
		}else{
			this._router.navigate(['/']);
			return false;
		}
	}

}