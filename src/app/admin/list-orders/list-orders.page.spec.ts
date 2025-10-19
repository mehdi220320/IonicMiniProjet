import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListOrdersPage } from './list-orders.page';

describe('ListOrdersPage', () => {
  let component: ListOrdersPage;
  let fixture: ComponentFixture<ListOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
