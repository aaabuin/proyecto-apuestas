
import { ModuleWithProviders } from '@angular/core';
import { Routes,RouterModule } from '@angular/router';

import { HomeComponent } from './components/home.component';
import { RegisterComponent } from './components/register.component';
import { EditUserComponent } from './components/edit-user.component';
import { NewBetComponent} from './components/new-bet.component';
import { TipsterPageComponent} from './components/tipster-page.component';
import { PersonalPageComponent} from './components/personal-page.component';
import { SubscriptionsPageComponent} from './components/subscriptions-page.component';
import { TipstersListComponent} from './components/tipsters-list.component';
import { MyTipstersListComponent} from './components/my-tipsters-list.component';
import { PickComponent } from './components/pick.component';

import {UserGuard} from './config/user.guard';
//import {AdminGuard} from './config/admin.guard';

const appRoutes: Routes = [
        {path: '', component: HomeComponent},
        {path: 'registro', component: RegisterComponent},
        {path: 'edit', component: EditUserComponent,canActivate:[UserGuard]},
        {path: 'apuesta', component: NewBetComponent ,canActivate:[UserGuard]},
        {path: 'personal', component: PersonalPageComponent ,canActivate:[UserGuard]},
        {path: 'tipster/:id', component: TipsterPageComponent},
        {path: 'tipsters', component: TipstersListComponent},
        {path: 'subscriptions', component: SubscriptionsPageComponent,canActivate:[UserGuard]},
        {path: 'my-tipsters', component: MyTipstersListComponent,canActivate:[UserGuard]},
        {path: 'pick/:id', component: PickComponent},
        {path: '**', component: HomeComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
