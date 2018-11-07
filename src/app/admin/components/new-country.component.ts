import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Country } from '../../models/country';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { CountryService } from '../../services/country.service';


@Component({
    selector: 'new-country',
    templateUrl: '../views/new-country.html'
})

export class NewCountryComponent{

    public country: Country;
    public filesToUpload: Array<File>;
    public identity;
    public url_upload:string;
    public error: string;
    public success:string;

    constructor(
        private _userService: UserService,
        private _countryService: CountryService,
        private _uploadService: UploadService
      ){
        this.country = new Country(null,"","",1, null, null);
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
            this.country.image= result.fileName;
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
        this._countryService.add(this.country).subscribe(
          response=>{        
              //if(response){} no hace falta comprobar porque si entra aqui es que existe response(id del usuario registrado)
              this.country = new Country(null,"","",1, null, null);
              this.success="País añadido correctamente.";
              //this.cargarListaPaises();
              window.location.href = "/admin/countries";
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
        this._uploadService.deleteTempImage( this.country.image ).subscribe(
            response=>{
                this.country.image = "";
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
  