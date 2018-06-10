import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { offCanvasFrames } from '../../constants';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  frameId = offCanvasFrames;

  featuredImage:File;
  featuredCrop: Croppie;

  featuredImageFlipped: boolean = false;

  //imageEditMode:boolean = false;

  @ViewChild('featuredImageInput') featuredImageInput:ElementRef;
  @ViewChild('featuredImagePreview') featuredImagePreview:ElementRef;

  constructor(private store:Store) { }

  ngOnInit() {

  }

  isFrameOpened$(val:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened === val);
  }

  selectFeatured() {
    let file:File = this.featuredImageInput.nativeElement.files[0];
    if(file && file.type === 'image/jpeg' && FileReader) {
      this.featuredImage = file;
      let fr = new FileReader();
      fr.onload = () => {
        this.featuredImagePreview.nativeElement.src = fr.result;
        this.showCrop();
      };
      fr.readAsDataURL(file);
    }
  }

  showCrop() {
    if(this.featuredCrop) this.featuredCrop.destroy();
    this.featuredCrop = new Croppie(this.featuredImagePreview.nativeElement, {
      viewport: { width: 150, height: 150 },
      boundary: {width: 200, height: 200},
      enableOrientation: true,
      mouseWheelZoom: 'ctrl'
    });
  }

  triggerFeaturedInput() {
    this.featuredImageInput.nativeElement.click();
  }

  rotateLeft() {
    this.featuredCrop.rotate(90);
  }

  rotateRight() {
    this.featuredCrop.rotate(-90);
  }

  flip() {
    this.featuredCrop.bind({
      url: this.featuredImagePreview.nativeElement.src,
      orientation: this.featuredImageFlipped?1:2,
      zoom: this.featuredCrop.get().zoom
    });
    this.featuredImageFlipped = !this.featuredImageFlipped;
  }

}
