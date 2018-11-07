import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Sport } from '../../models/sport';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { SportService } from '../../services/sport.service';


@Component({
    selector: 'new-sport',
    templateUrl: '../views/new-sport.html'
})

export class NewSportComponent{

    public sport: Sport;
    public filesToUpload: Array<File>;
    public identity;
    public url_upload:string;
    public error: string;
    public success:string;

    constructor(
        private _userService: UserService,
        private _sportService: SportService,
        private _uploadService: UploadService
      ){
        this.sport = new Sport(null,"","",1,null,null);
        this.url_upload= GLOBAL.url+"upload/";
        this.identity = this._userService.getIdentity();
        this.error=null;
        this.success=null;
      }


    fileChangeEvent(fileInput: any){
    this.filesToUpload = <Array<File>>fileInput.target.files;
    
    if (this.filesToUpload!=null){
        this._uploadService.makeFileRequest(GLOBAL.url+'upload/upload-image', this.filesToUpload, this.identity.token, 'image')
        .then((result: any) => {
            this.sport.image= result.fileName;
            },
            (error: any) => {    
                this.error=JSON.parse(error).message;
                setTimeout(() => {
                    this.error=null;
                },3000);
            });
    }
    }

    onSubmit(form){
        this._sportService.add(this.sport).subscribe(
          response=>{        
              //if(response){} no hace falta comprobar porque si entra aqui es que existe response(id del usuario registrado)
              this.sport = new Sport(null,"","",1,null,null);
              this.success="Deporte añadido correctamente.";
              //this.cargarListaDeportes();
              window.location.href = "/admin/sports";
              setTimeout(() => {
                  this.success=null;
              },1000);
          },
          error=>{
              var body= JSON.parse(error._body);
              this.error=body['message'];
              setTimeout(() => {
                  this.error=null;
              },3000);
    
          } 
        )
      }

      removeImage(){
        this._uploadService.deleteTempImage( this.sport.image ).subscribe(
            response=>{
                this.sport.image = "";
            },
            error=>{
                this.error="Error borrando la imagen";
                this.success= null;   
                setTimeout(() => {
                    this.error=null;
                }, 3000);
            }
        );
      }

}
  