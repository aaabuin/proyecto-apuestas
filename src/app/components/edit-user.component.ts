import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../models/user';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { UploadService } from '../services/upload.service';

@Component({
    selector: 'edit-user',
    templateUrl: '../views/edit-user.html',
    providers: [UserService]
})

export class EditUserComponent implements OnInit{
    public user: User;
    public url: string;
    public newPassword: string;
    public newPassword2: string;
    public identity;
    public filesToUpload: Array<File>;
    public changeImage:boolean;
    public success:string;
    public error:string;

    constructor(
        private _route: ActivatedRoute,
        private _router:Router,
        private _userService: UserService,
        private _uploadService: UploadService
    ){
        this.identity = this._userService.getIdentity();
        this.user= new User(null ,'','','','','', null);
        this.url= GLOBAL.url+"user/";
        this.changeImage=false;
        
    }
        
    ngOnInit(){

        this._userService.getMyUser().subscribe(
            response=>{
                this.user.id= response.id;
                this.user.username= response.username;
                this.user.email= response.email;
                this.user.description= response.description;
                this.user.avatar= response.avatar;
        },
        error=>{
            var body= JSON.parse(error._body);
            this.error=body['message'];
        }
    );
        
    }

    onSubmit(form){
        
        if (form=="editUser"){
            this._userService.updateMyUser(this.user).subscribe(
                response=>{
                  //  this.exito="Datos modificados correctamente.";
                    this.success=response.message;
                    this.error=null;
                    if (this.filesToUpload!=null){
                        this._uploadService.makeFileRequest(this.url+'user-image', this.filesToUpload, this.identity.token, 'image')
                        .then((result: any) => {
                            this.user.avatar = result.message;
                            this.identity = this._userService.getIdentity();
                            this.identity.avatar= this.user.avatar;
                            this.changeImage=null;
                            localStorage.setItem('identity', JSON.stringify(this.identity));
                           },
                           (error: any) => {    
                            this.error=JSON.parse(error).message;
                           });
                    }
                    setTimeout(() => {
                        this.success=null;
                        this.error=null;
                    }, 3000);
                    
                },
                error=>{
                    var body= JSON.parse(error._body);
                    this.error=body.message;
                    this.success=null;
                    setTimeout(() => {
                        this.error=null;
                    }, 3000);
                }
            );
        }
        if (form=="cambiarPasswordForm"){
            if(this.newPassword===this.newPassword2){
            this._userService.updateMyPassword(this.user.password, this.newPassword ).subscribe(
                response=>{
                    this.success="Contraseña modificada correctamente.";
                    this.error=null;
                    //form.cambiarPasswordForm.reset();
                    this.newPassword="";
                    this.newPassword2="";
                    this.user.password="";
                    setTimeout(() => {
                        this.success=null;
                    }, 3000);

                },
                error=>{
                    var body= JSON.parse(error._body);
                    this.error=body.message;
                    this.success=null;
                    setTimeout(() => {
                        this.error=null;
                    }, 3000);
                }
            )
            }
            else{
                this.error="Las contraseñas no coindicen.";
                this.success=null;
            }  
        }
    }

	fileChangeEvent(fileInput: any){
		this.filesToUpload = <Array<File>>fileInput.target.files;
    }
    
    changeAvatar(){
        this.changeImage=!this.changeImage;
    }

    deleteAvatar(){
        this._userService.deleteAvatar().subscribe(
            response=>{
                this.user.avatar = null;
                this.identity = this._userService.getIdentity();
                this.identity.avatar= null;
                localStorage.setItem('identity', JSON.stringify(this.identity));
            },
            error=>{
                this.error="Error quitando la imagen del usuario.";
                this.success= null;   
                setTimeout(() => {
                    this.error=null;
                }, 3000);
            }
        );
    }
}
