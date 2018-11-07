import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {routing, appRoutingProviders} from './app.routing';
import {NgxPaginationModule} from 'ngx-pagination';
//import {APP_BASE_HREF} from '@angular/common';

import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as more from 'highcharts/highcharts-more.src';
import * as exporting from 'highcharts/modules/exporting.src';
import * as solidgauge from 'highcharts/modules/solid-gauge.src';
  

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header.component';
import { HomeComponent } from './components/home.component';
import { RegisterComponent } from './components/register.component';
import { LoginComponent } from './components/login.component';
import { EditUserComponent } from './components/edit-user.component';
import { RecoverPasswordComponent } from './components/recover-password.component';
import { NewBetComponent } from './components/new-bet.component';
import { SelectEventComponent } from './components/select-event.component';
import { TipsterPageComponent} from './components/tipster-page.component';
import { PersonalPageComponent} from './components/personal-page.component';
import { SubscriptionsPageComponent} from './components/subscriptions-page.component';
import { SettleBetComponent} from './components/settle-bet.component';
import { StatsComponent } from './components/stats.component';
import { TipstersListComponent } from './components/tipsters-list.component';
import { PickComponent } from './components/pick.component';
import { FilterBetsComponent } from './components/filter-bets.component';
import { FilterTipstersComponent } from './components/filter-tipsters.component';
import { MyTipstersListComponent } from './components/my-tipsters-list.component';
import { TipsterFilterListComponent } from './components/tipster-filter-list.component';


import {UserService} from './services/user.service'; 
import {UploadService} from './services/upload.service';
import {PickService} from './services/pick.service';
import {BetService} from './services/bet.service';
import {SubscriptionService} from './services/subscription.service';
import {SportService} from './services/sport.service';
import {EventService} from './services/event.service';
import {CountryService} from './services/country.service';
import {CompetitionService} from './services/competition.service';
import {BookieService} from './services/bookie.service';
import {SubscriptionBetService} from './services/subscriptionBet.service';
import {SubscriptionPickService} from './services/subscriptionPick.service';

import {StatsService} from './services/stats.service';

import {ordenarApuestasPorFecha} from './pipes/ordenarApuestasPorFecha.pipe';
import {ordenarTipsters} from './pipes/ordenarTipsters.pipe';

import {UserGuard} from './config/user.guard';


import { AdminModule } from './admin/admin.module';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RegisterComponent,
    EditUserComponent,
    HomeComponent,
    LoginComponent,
    RecoverPasswordComponent,
    NewBetComponent,
    SelectEventComponent,
    TipsterPageComponent,
    PersonalPageComponent,
    SettleBetComponent,
    ordenarApuestasPorFecha,
    ordenarTipsters,
    StatsComponent,
    TipstersListComponent,
    PickComponent,
    FilterBetsComponent,
    FilterTipstersComponent,
    SubscriptionsPageComponent,
    MyTipstersListComponent,
    TipsterFilterListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    AdminModule,
    NgxPaginationModule,
    ChartModule 
  ],
  providers: [
    appRoutingProviders,
    UserService,
    UploadService,
    UserGuard,
    BetService,
    EventService,
    PickService,
    SubscriptionService,
    SportService,
    CountryService,
    CompetitionService,
    BookieService,
    SubscriptionBetService,
    SubscriptionPickService,
    StatsService,
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ more, exporting, solidgauge ] }
    //{provide: APP_BASE_HREF, useValue: '/dist'}
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
