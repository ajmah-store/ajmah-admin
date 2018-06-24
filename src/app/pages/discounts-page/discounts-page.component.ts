import { Component, OnInit } from '@angular/core';
import { ArrayList } from '@arjunatlast/jsds';

@Component({
  selector: 'app-discounts-page',
  templateUrl: './discounts-page.component.html',
  styleUrls: ['./discounts-page.component.scss']
})
export class DiscountsPageComponent implements OnInit {

  range:number = 20;

  constructor() { }

  ngOnInit() {
  }

}
