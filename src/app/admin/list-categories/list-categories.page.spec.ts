import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListCategoriesPage } from './list-categories.page';

describe('ListCategoriesPage', () => {
  let component: ListCategoriesPage;
  let fixture: ComponentFixture<ListCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
