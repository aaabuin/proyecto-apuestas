import { Component,DoCheck, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Country } from '../../models/country';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { CountryService } from '../../services/country.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'countries',
  templateUrl: '../views/countries.html'
})

export class CountriesComponent implements OnInit{

 public country: Country;
 public filesToUpload: Array<File>;
 public url:string;
 public identity;
 public url_upload:string;
 public modifiedCountryId: number;
 public success:string;
 public error:string;
 public countriesList:Array<Country>
   
  constructor(
    private _userService: UserService,
    private _countryService: CountryService,
    private _uploadService: UploadService
  ){
    this.country = new Country(null,"","",1,null,null);
    this.url= GLOBAL.url+"country/";
    this.url_upload= GLOBAL.url+"upload/";
    this.identity = this._userService.getIdentity();
    this.success=null;
    this.modifiedCountryId=null;
  }

  ngOnInit(){
    this.loadCountriesList();
  }

  fileChangeEvent(fileInput: any, id){
    this.filesToUpload = <Array<File>>fileInput.target.files;
    
    if (this.filesToUpload!=null){
      this._uploadService.makeFileRequest(GLOBAL.url+'upload/upload-image', this.filesToUpload, this.identity.token, 'image')
      .then((result: any) => {
          this.country = this.countriesList.find(o => o.id === id);
        //MOVER IMAGEN A CARPETA FINAL

          this._countryService.saveImage(this.country, result.fileName).subscribe(
            response=>{
              this.country = new Country(null,"","",1,null,null);
              this.loadCountriesList();
            },
            error=>{
                var body= JSON.parse(error._body);
                this.error=body['message'];
                setTimeout(() => {
                    this.error=null;
                },3000);
            } 
          );
         },
         (error: any) => {    
          this.error= JSON.parse(error).message;
          setTimeout(() => {
            this.error=null;
        },2500);
         });
    }
  }

  loadCountriesList(){
    this._countryService.listCountries().subscribe(
      response=>{
        this.countriesList=response;
      }
    );
  }

  changeName(id){
    let newName = $('#countryEditable'+id).html();
    this.country = this.countriesList.find(o => o.id === id);
    let previousName=this.country.name;
    this.country.name= newName;

    this._countryService.edit(this.country).subscribe(
      response=>{        
        this.modifiedCountryId=id;
        this.country = new Country(null,"","",1,null,null);
        this.loadCountriesList();
        setTimeout(() => {
            this.modifiedCountryId=null;
        },3000);
    },
    error=>{
        this.country.name= previousName;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );

  }

  enableCountry(id){
    this.country = this.countriesList.find(o => o.id === id);
    let previousState=this.country.status;
    this.country.status= 1;

    this._countryService.edit(this.country).subscribe(
      response=>{        
        this.country = new Country(null,"","",1,null,null);
        this.success = "Pais modificado con exito.";
        this.loadCountriesList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.country.status= previousState;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );

  }

  disableCountry(id){
    this.country = this.countriesList.find(o => o.id === id);
    let previousState=this.country.status;
    this.country.status= 0;

    this._countryService.edit(this.country).subscribe(
      response=>{        
        this.country = new Country(null,"","",1,null,null);
        this.success = "Pais modificado con exito.";
        this.loadCountriesList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.country.status= previousState;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );
  }

  deleteCountry(id){

    this.country = this.countriesList.find(o => o.id === id);

    if (this.country.image != ''){
      this._countryService.deleteImage( this.country ).subscribe(
        response=>{
          this.country.image = "";
          this._countryService.delete( this.country.id ).subscribe(
          response=>{
            this.success="Pais borrado.";
            this.loadCountriesList();
            setTimeout(() => {
              this.success=null;
            },2000);
          }
          ); 
        }
      );
    }else{
      this._countryService.delete( this.country.id ).subscribe(
        response=>{
          this.success="Pais borrado.";
          this.loadCountriesList();
          setTimeout(() => {
            this.success=null;
          },2000);
        }
        ); 
    }
  }

  sortCountry(key, mode){
      /*
      this._paisService.listarPaisesOrdenados(clave).subscribe(
        response=>{
          this.listaPaises=response;
        }
      );
      */
  }



  deleteCountryImage(id){
    this.country = this.countriesList.find(o => o.id === id);

    this._countryService.deleteImage( this.country ).subscribe(
        response=>{
            this.country.image = "";
        },
        error=>{
          var body= JSON.parse(error._body);
          this.error=body['message'];
        }
    );
  }


  disableEnter(id){
    $('#countryEditable'+id).on("keypress",function(e){
      var key = e.keyCode || e.charCode;  // ie||others
      if(key == 13){
        
         $(this).blur(); 
      }  
         
  });
  }

}
