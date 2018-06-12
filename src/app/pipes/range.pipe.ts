import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range'
})
export class RangePipe implements PipeTransform {

  transform(value: number, start:number=1, step:number=1): number[] {
    return new Array(value).fill(0).map((x,i) => start+i*step);
  }

}
