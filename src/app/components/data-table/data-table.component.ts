import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Map, ArrayList } from '@arjunatlast/jsds';
import { Product } from '../../models/product.model';
import { transition, trigger, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        style({opacity:0}),
        animate('300ms ease-in', style({opacity:1}))
      ]),
      transition('* => *', [

        query('.data-row:leave', stagger('25ms', [
            animate('100ms ease-in', style({opacity:0, transform:'translateY(-30px)'}))
        ]), {optional: true}),

        query('.data-row:enter', style({ opacity: 0, transform:'translateY(-50px)' }), {optional: true}),

        query('.data-row:enter', [stagger('100ms', [
            animate('300ms ease-in', style({opacity:1, transform:'translateY(0px)'}))
        ])], {optional:true}),

      ])
    ]),
  ]
})
export class DataTableComponent implements OnInit {

  @Input() keys: string[];
  @Input() attributes: string[];
  @Input() datas: ArrayList<any>;
  @Input() selectedDatas: ArrayList<any> = new ArrayList<any>();
  @Input() map: Map<any, any>;
  @Input() limit: number = 10;
  @Input('sortBy') sortKey:string;

  @Output('edit') editClicked = new EventEmitter<any>();
  @Output('delete') deleteClicked = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();
  @Output() unselect = new EventEmitter<any>();

  private pageIndex:number = 0;

  private clickTimeOut:any;

  private sortAsc:boolean = true;

  constructor() { }

  ngOnInit() {

    if(this.keys && !this.attributes) this.attributes = this.keys;

    if(!this.sortKey && this.keys) this.sortKey = this.keys[0]; 

  }

  get pageNo():number {
    return this.pageIndex+1;
  }

  set pageNo(val:number) {
    this.gotoPage(val);
  }

  filteredData():ArrayList<Product> {
    let start = this.pageIndex*this.limit;
    return this.datas.subList(start, start+this.limit);
  }

  getData(data:any, key:string):any {

    let object = key.split(":")[0].trim();

    let name = object.split("=>")[0].trim();

    let mapping = object.split("=>")[1];

    if(mapping) return this.getData(this.map.get(this.getData(data, name)), mapping.trim());

    let path = name.split(".");
    
    for(let i=0, j=path.length; i<j; i++) {
      if(data !== undefined || data !== null) data = data[path[i]];
    }

    return data?data:'-';
  }

  getType(key:string):string {
    let res;
    return (res = key.split(":")[1]) && res.trim();
  }

  getStyle(key) {
    return {
      narrow: this.getType(key) === 'image',
    };
  }

  getFooterDesc() {
    let start = this.pageIndex*this.limit;
    let end = start + this.filteredData().size();
    return `Showing ${Math.min(start+1, end)}-${end} of ${this.datas.size()}`;
  }

  isSelected(data):boolean {
    return this.selectedDatas.contains(data);
  }

  emitEdit($event:any) {
    this.editClicked.emit($event);
  }

  emitDelete($event:any) {
    this.deleteClicked.emit($event);
  }

  emitSelect($event:any) {
    this.select.emit($event);
  }

  emitUnselect($event:any) {
    this.unselect.emit($event);
  }

  startTimeout($event:any) {
    if(this.isSelected($event)) this.emitUnselect($event);
    this.clickTimeOut = setTimeout(()=>{this.emitSelect($event)}, 1000);
  }

  stopTimeout() {
    clearTimeout(this.clickTimeOut);
  }

  pageCount() {
    return Math.ceil(this.datas.size()/this.limit);
  }

  //navigation
  nextPage() {
    this.pageIndex = Math.min(this.pageIndex+1, this.pageCount()-1);
  }

  prevPage() {
    this.pageIndex = Math.max(this.pageIndex-1, 0);
  }

  gotoPage(val:number) {
    this.pageIndex = Math.min(Math.max(0, val-1), this.pageCount()-1);
  }

  //sort
  sortBy(key:string, asc:boolean=true) {
    if(this.getType(key)=='image') return;
    this.sortKey = key;
    this.sortAsc = asc;
  }

  sortData(datas:any[]):any[] {
    return datas.sort(
      (a,b) => {
        return (this.sortAsc?1:-1)*this.compare( this.getData(a, this.sortKey)/*first data*/, this.getData(b, this.sortKey)/*second data*/, this.sortKey )
      }
    )
  }

  private compare(a, b, key):number {
    if (this.getType(key)=='number' || this.getType(key)=='currency') {
       return parseInt(a)-parseInt(b);
    }
    else if (typeof a == 'object') {
      return JSON.stringify(a).localeCompare(JSON.stringify(b));
    }
    else {
      return a.localeCompare(b);
    }

  }

}
