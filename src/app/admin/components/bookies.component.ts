import { Component,DoCheck, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Bookie } from '../../models/bookie';
import { GLOBAL } from '../../services/global';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { BookieService } from '../../services/bookie.service';

declare var jQuery:any;
declare var $:any;



@Component({
  selector: 'bookies',
  templateUrl: '../views/bookies.html'
})

export class BookiesComponent implements OnInit{

 public bookie: Bookie;
 public filesToUpload: Array<File>;
 public url:string;
 public identity;
 public url_upload:string;
 public modifiedBookie: number;
 public success:string;
 public error:string;
 public bookiesList:Array<Bookie>
   
  constructor(
    private _userService: UserService,
    private _bookieService: BookieService,
    private _uploadService: UploadService
  ){
    this.bookie = new Bookie(null,"","",1,null,null);
    this.url= GLOBAL.url+"bookie/";
    this.url_upload= GLOBAL.url+"upload/";
    this.identity = this._userService.getIdentity();
    this.success=null;

    this.modifiedBookie=null;
  }

  ngOnInit(){
    this.loadBookiesList();
  }

  fileChangeEvent(fileInput: any, id){
    this.filesToUpload = <Array<File>>fileInput.target.files;
    

    if (this.filesToUpload!=null){
      this._uploadService.makeFileRequest(GLOBAL.url+'upload/upload-image', this.filesToUpload, this.identity.token, 'image')
      .then((result: any) => {
          this.bookie = this.bookiesList.find(o => o.id === id);
        //MOVER IMAGEN A CARPETA FINAL

          this._bookieService.saveImage(this.bookie, result.fileName).subscribe(
            response=>{
              this.bookie = new Bookie(null,"","",1,null,null);
              this.loadBookiesList();
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

  loadBookiesList(){
    this._bookieService.listBookies().subscribe(
      response=>{
        this.bookiesList=response;
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
    let newName = $('#bookieEditable'+id).html();
    this.bookie = this.bookiesList.find(o => o.id === id);
    let previousName=this.bookie.name;
    this.bookie.name= newName;
    this._bookieService.edit(this.bookie).subscribe(
      response=>{        
        this.modifiedBookie=id;
        this.bookie = new Bookie(null,"","",1,null,null);
        this.loadBookiesList();
        setTimeout(() => {
            this.modifiedBookie=null;
        },3000);
    },
    error=>{
        this.bookie.name =previousName;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);
    } 
    );
  }

  enableBookie(id){
    this.bookie = this.bookiesList.find(o => o.id === id);
    let previousState= this.bookie.status;
    this.bookie.status= 1;

    this._bookieService.edit(this.bookie).subscribe(
      response=>{        
        this.bookie = new Bookie(null,"","",1,null,null);
        this.success = "Bookie modificado con exito.";
        this.loadBookiesList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.bookie.status= previousState;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );

  }

  disableBookie(id){
    this.bookie = this.bookiesList.find(o => o.id === id);
    let previousState= this.bookie.status;
    this.bookie.status= 0;

    this._bookieService.edit(this.bookie).subscribe(
      response=>{        
        this.bookie = new Bookie(null,"","",1,null,null);
        this.success = "Bookie modificado con exito.";
        this.loadBookiesList();
        setTimeout(() => {
          this.success = null;
        },3000);
    },
    error=>{
        this.bookie.status= previousState;
        var body= JSON.parse(error._body);
        this.error=body['message'];
        setTimeout(() => {
            this.error=null;
        },3000);

    } 
    );
  }

  deleteBookie(id){

    this.bookie = this.bookiesList.find(o => o.id === id);

    if (this.bookie.image != ''){
      this._bookieService.deleteImage( this.bookie ).subscribe(
        response=>{
            
          this.bookie.image = "";
          
          this._bookieService.delete( this.bookie.id ).subscribe(
          response=>{
            this.success="Bookie borrado.";
            this.loadBookiesList();
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
      );
    }else{
      this._bookieService.delete( this.bookie.id ).subscribe(
        response=>{
          this.success="Bookie borrado.";
          this.loadBookiesList();
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

  orderBookie(clave,orden){
      /*
      this._bookieService.listarBookiesOrdenadas(clave).subscribe(
        response=>{
          this.listaBookies=response;
        }
      );
      */
  }

  deleteBookieImage(id){
    this.bookie = this.bookiesList.find(o => o.id === id);

    this._bookieService.deleteImage( this.bookie ).subscribe(
        response=>{
            this.bookie.image = "";
        },error=>{
          this.error=JSON.parse(error._body).message;
          this.success= null;   
          setTimeout(() => {
              this.error=null;
          }, 3000);
      }
    );
  }


  disableEnter(id){
    $('#bookieEditable'+id).on("keypress",function(e){
      var key = e.keyCode || e.charCode;  // ie||others
      if(key == 13){
        
         $(this).blur(); 
      }  
         
  });
  }
}
