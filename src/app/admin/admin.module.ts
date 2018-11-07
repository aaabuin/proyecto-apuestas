/*
import { NgModule } from '@angular/core';

@NgModule({
	declarations: [
	
		
	],
	imports: [
		
	],
	exports: [
	],
	providers: [
	
	]
})

export class AdminModule { }
*/


// Modulos

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from  '@angular/forms';
import { HttpModule } from '@angular/http';
import { AdminRouting } from './admin.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Componentes

import { AdminComponent } from './admin.component';
import { BookiesComponent } from './components/bookies.component';
import { NewBookieComponent } from './components/new-bookie.component';
import { SportsComponent } from './components/sports.component';
import { NewSportComponent } from './components/new-sport.component';
import { CountriesComponent } from './components/countries.component';
import { NewCountryComponent } from './components/new-country.component';
import { CompetitionsComponent } from './components/competitions.component';
import { NewCompetitionComponent } from './components/new-competition.component';
import { EventsComponent } from './components/events.component';
import { NewEventComponent } from './components/new-event.component';



// Servicios

import {UserService} from '../services/user.service';
import {SportService} from '../services/sport.service';
import {CountryService} from '../services/country.service';
import {BookieService} from '../services/bookie.service';
import {CompetitionService} from '../services/competition.service';
import {EventService} from '../services/event.service';
import {AdminGuard} from '../config/admin.guard';
import {ordenarCompeticion} from './pipes/ordenarCompeticion.pipe';
import {ordenarEventos} from './pipes/ordenarEventos.pipe';


@NgModule({
	declarations: [
		AdminComponent,
		BookiesComponent,
		NewBookieComponent,
		SportsComponent,
		NewSportComponent,
		CompetitionsComponent,
		NewCompetitionComponent,
		CountriesComponent,
		NewCountryComponent,
		EventsComponent,
		NewEventComponent,
		ordenarCompeticion,
		ordenarEventos
		
	],
	imports: [
		CommonModule,
		FormsModule,
		HttpModule,
		AdminRouting,
		BrowserAnimationsModule
	],
	exports: [
	],
	providers: [
		UserService,
		SportService,
		CountryService,
		BookieService,
		CompetitionService,
		EventService,
		AdminGuard
	]
})

export class AdminModule { }