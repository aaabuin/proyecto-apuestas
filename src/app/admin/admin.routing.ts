import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { AdminComponent } from './admin.component';
import { BookiesComponent } from './components/bookies.component';
import { SportsComponent } from './components/sports.component';
import { CompetitionsComponent } from './components/competitions.component';
import { CountriesComponent } from './components/countries.component';
import { EventsComponent } from './components/events.component';

import {AdminGuard} from '../config/admin.guard';

const adminRoutes: Routes = [
	{
		path: 'admin',
		component: AdminComponent,
		canActivate: [AdminGuard],
		children: [
			{ path: '', redirectTo: 'deportes', pathMatch: 'full' },
			{ path: 'sports', component: SportsComponent , canActivate:[AdminGuard]},
			{ path: 'countries', component: CountriesComponent , canActivate:[AdminGuard]},
			{ path: 'competitions', component: CompetitionsComponent, canActivate:[AdminGuard] },
			{ path: 'bookies', component: BookiesComponent , canActivate:[AdminGuard]},
			{ path: 'events', component: EventsComponent , canActivate:[AdminGuard]}
		]
    }
    //,{ path: 'listado-del-panel', component: ListComponent }
];

@NgModule({
	imports: [
		RouterModule.forChild(adminRoutes)
	],
	exports: [
		RouterModule
	]
})
export class AdminRouting { }