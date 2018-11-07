import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../services/global';

import { Competition } from '../../models/competition';
import { Sport } from '../../models/sport';
import { Country } from '../../models/country';

import { UserService } from '../../services/user.service';
import { CompetitionService } from '../../services/competition.service';
import { SportService } from '../../services/sport.service';
import { CountryService } from '../../services/country.service';

@Component({
    selector: 'new-competition',
    templateUrl: '../views/new-competition.html'
})

export class NewCompetitionComponent implements OnInit{

    public competition: Competition;
    public identity;
    public error: string;
    public success:string;
    public countriesList: Array<Country>;
    public sportsList: Array<Sport>;

    constructor(
        private _userService: UserService,
        private _competitionService: CompetitionService,
        private _sportService:SportService,
        private _countryService: CountryService
      ){
        this.competition = new Competition(null,"",1, new Country(null, "", "", null, null, null),new Sport(null, "", "", null,null,null), null, null);
        this.identity = this._userService.getIdentity();
        this.error=null;
        this.success=null;
      }

    ngOnInit(){
        
        this._sportService.listActiveSports().subscribe(
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

        this._countryService.listActiveCountries().subscribe(
            response=>{
                this.countriesList=response;
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
    
    onSubmit(form){

        this._competitionService.add(this.competition).subscribe(
          response=>{        
              //this.competicion = new Competicion(null,"",1, null,null);
              form.reset();
              this.success="Competicion añadida correctamente.";
              //this.cargarListaCompeticiones();
              window.location.href = "/admin/competitions";
              setTimeout(() => {
                  this.success=null;
              },2000);
          },
          error=>{
              var body= JSON.parse(error._body);
              this.error=body['message'];
              setTimeout(() => {
                  this.error=null;
              },2500);
    
          } 
        )
      }


}
  