import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Bookie } from '../../models/bookie';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { BookieService } from '../../services/bookie.service';


@Component({
    selector: 'new-bookie',
    templateUrl: '../views/new-bookie.html'
})

export class NewBookieComponent{

    public bookie: Bookie;
    public filesToUpload: Array<File>;
    public identity;
    public url_upload:string;
    public error: string;
    public success:string;

    constructor(
        private _userService: UserService,
        private _bookieService: BookieService,
        private _uploadService: UploadService
      ){
        this.bookie = new Bookie(null,"","",1,null,null);
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
            this.bookie.image= result.fileName;
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
        this._bookieService.add(this.bookie).subscribe(
          response=>{        
              //if(response){} no hace falta comprobar porque si entra aqui es que existe response(id del usuario registrado)
              this.bookie = new Bookie(null,"","",1,null,null);
    
              this.success="Bookie añadida correctamente.";
              //this.cargarListaBookies();
              window.location.href = "/admin/bookies";
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
        this._uploadService.deleteTempImage( this.bookie.image ).subscribe(
            response=>{
                this.bookie.image = "";
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
  