import { Component, OnInit } from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {Todo} from "../todo/todo";
import {TodoService} from "../todo/todo.service";
import {NgForm}    from 'angular2/common';
import {status} from '../todo/todos.status'

@Component({
    selector: 'my-todo-detail',
    templateUrl: 'app/todo-detail/todo-detail.component.html'
})
export class TodoDetailComponent implements OnInit {
    todo: Todo;
    errorMessage: string;
    status = status;
    id: string;

    constructor(
        private _todoService: TodoService,
        private _routeParams: RouteParams,
        private _router: Router) {
          this.todo = new Todo(undefined,undefined,undefined,undefined);
    }

    ngOnInit() {
      if(this._routeParams.get('id')){
        this.id = this._routeParams.get('id');
        this._todoService.getTodoId(this.id)
            .subscribe(todo => {this.todo.text = todo.text; this.todo.status = todo.status},
            error =>  this.errorMessage = <any>error);
            }
    }

    save(){
      if(this.id != null){
        this._todoService.putTodo(this.todo, this.id).subscribe(
                todo  => this._router.navigate(['Todos']),
                error =>  this.errorMessage = <any>error);
      } else {
        this.todo.status = this.status[0];
        this._todoService.addTodo(this.todo).subscribe(
                todo  => this._router.navigate(['Todos']),
                error =>  this.errorMessage = <any>error);
      }
    }

    goBack() {
        window.history.back();
    }
}
