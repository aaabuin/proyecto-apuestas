import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin',
  templateUrl: './admin.html'
})

export class AdminComponent implements OnInit{
 public title:string;


  constructor(
  ){
    this.title= 'Módulo de administración';
  }

  ngOnInit(){
  }
}
