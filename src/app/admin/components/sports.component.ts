import { Component,DoCheck, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Sport } from '../../models/sport';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { SportService } from '../../services/sport.service';
//import { DeporteServicio } from '../services/deporte.servicio';
declare var jQuery:any;
declare var $:any;



@Component({
  selector: 'sports',
  templateUrl: '../views/sports.html'
})

export class SportsComponent implements OnInit{

 public sport: Sport;
 public filesToUpload: Array<File>;
 public url:string;
 public identity;
 public url_upload:string;
 public modifiedSport: number;
 public success:string;
 public error:string;
 public sportsList:Array<Sport>;
   
  constructor(
    private _userService: UserService,
    private _sportService: SportService,
    private _uploadService: UploadService
  ){
    this.sport = new Sport(null,"","",1,null,null);
    this.url= GLOBAL.url+"sport/";
    this.url_upload= GLOBAL.url+"upload/";
    this.identity = this._userService.getIdentity();
    this.success=null;

    this.modifiedSport=null;
  }

  ngOnInit(){
    this.loadSportsList();
  }

  fileChangeEvent(fileInput: any, id){
    this.filesToUpload = <Array<File>>fileInput.target.files;
    

    if (this.filesToUpload!=null){
      this._uploadService.makeFileRequest(GLOBAL.url+'upload/upload-image', this.filesToUpload, this.identity.token, 'image')
      .then((result: any) => {
          this.sport = this.sportsList.find(o => o.id === id);
        //MOVER IMAGEN A CARPETA FINAL

          this._sportService.saveImage(this.sport, result.fileName).subscribe(
            response=>{
              //console.log(response);
              this.sport = new Sport(null,"","",1,null,null);
            // window.location.href = "/admin/deportes";
              this.loadSportsList();
              //setTimeout(() => {
              //    this.exito="Imagen guardada con exito";
              //},3000);
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

  loadSportsList(){
    this._sportService.listSports().subscribe(
      response=>{
        this.sportsList=response;
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


  changeName(id){
    let newName = $('#sportEditable'+id).html();
    this.sport = this.sportsList.find(o => o.id === id);
    let previousName=this.sport.name;
    this.sport.name= newName;

    this._sportService.edit(this.sport).subscribe(
      response=>{        
        this.modifiedSport=id;
        this.sport = new Sport(null,"","",1,null,null);
        this.loadSportsList();
        setTimeout(() => {
            this.modifiedSport=null;
        },3000);
    },
    error=>{
        this.sport.name= previousName;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );

  }

  activateSport(id){
    this.sport = this.sportsList.find(o => o.id === id);
    let previousStatus=this.sport.status;
    this.sport.status= 1;
    


    this._sportService.edit(this.sport).subscribe(
      response=>{        
        this.sport = new Sport(null,"","",1,null,null);
        this.success = "Deporte modificado con exito.";
        this.loadSportsList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.sport.status= previousStatus;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);
    } 
    );
  }

  disableSport(id){
    this.sport = this.sportsList.find(o => o.id === id);
    let previousStatus=this.sport.status;
    this.sport.status= 0;

    this._sportService.edit(this.sport).subscribe(
      response=>{        
        this.sport = new Sport(null,"","",1,null,null);
        this.success = "Deporte modificado con exito.";
        this.loadSportsList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.sport.status= previousStatus;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);
    } 
    );
  }

  deleteSport(id){

    this.sport = this.sportsList.find(o => o.id === id);

    if (this.sport.image != ''){
      this._sportService.deleteImage( this.sport ).subscribe(
        response=>{
          this.sport.image = "";
          this._sportService.delete( this.sport.id ).subscribe(
          response=>{
            this.success="Deporte borrado.";
            this.loadSportsList();
            setTimeout(() => {
              this.success=null;
            },2000);
          },
          error=>{
            this.error=JSON.parse(error._body).message;
            this.success= null;   
            setTimeout(() => {
                this.error=null;
            }, 3000);
        }
          ); 
        },
        error=>{
          this.error=JSON.parse(error._body).message;
          this.success= null;   
          setTimeout(() => {
              this.error=null;
          }, 3000);
      }
            /*
            Debemos consiederar el error? Debemos actuar con promesa.catch()?
            ,
            error=>{
              var body= JSON.parse(error._body);
              this.error=body['message'];
            }
            */
      );
    }else{
      this._sportService.delete( this.sport.id ).subscribe(
        response=>{
          this.success="Deporte borrado.";
          this.loadSportsList();
          setTimeout(() => {
            this.success=null;
          },2000);
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

  sortSport(key,mode){
      /*
      this._deporteService.listarDeportesOrdenados(clave).subscribe(
        response=>{
          this.listaDeportes=response;
        }
      );
      */
  }



  deleteSportImage(id){
    this.sport = this.sportsList.find(o => o.id === id);

    this._sportService.deleteImage( this.sport ).subscribe(
        response=>{
            this.sport.image = "";
        },
        error=>{
          var body= JSON.parse(error._body);
          this.error=body['message'];
        }
    );
  }


  disableEnter(id){
    $('#sportEditable'+id).on("keypress",function(e){
      var key = e.keyCode || e.charCode;  // ie||others
      if(key == 13){
        
         $(this).blur(); 
      }  
         
  });
  }

}
