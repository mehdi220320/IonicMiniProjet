import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsProdPage } from './details-prod.page';

describe('DetailsProdPage', () => {
  let component: DetailsProdPage;
  let fixture: ComponentFixture<DetailsProdPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsProdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
