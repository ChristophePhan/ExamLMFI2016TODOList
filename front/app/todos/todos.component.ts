import {Component, OnInit} from 'angular2/core';
import {Router} from "angular2/router";
import {TodoDetailComponent} from "../todo-detail/todo-detail.component";
import {Todo} from "../todo/todo";
import {TodoService} from "../todo/todo.service";
import {TodoPipe} from './todos.pipe';
import {DatePipe} from './date.pipe';
import {status} from '../todo/todos.status'

@Component({
    selector: 'my-todos',
    templateUrl: 'app/todos/todos.component.html',
    pipes: [TodoPipe, DatePipe],
    directives: [TodoDetailComponent]
})
export class TodosComponent implements OnInit {
    errorMessage: string;
    todos: Todo[];
    filterValue:string = '';
    status = status;

    constructor(
        private _router: Router,
        private _todoService: TodoService) {
          this.todos = [];
    }

    ngOnInit() {
      this.getTodos();
    }

    getTodos() {
        this._todoService.getTodos()
            .subscribe(
              todos => this.todos = todos,
              error => this.errorMessage = <any>error
            );
    }

    gotoDetail(todo: Todo) {
        this._router.navigate(['TodoDetail', { id: todo.id }]);
    }

    gotoNewDetail() {
        this._router.navigate(['NewTodo']);
    }

    delete(todo: Todo) {
      this._todoService.deleteTodo(todo.id).subscribe(
              res  => {
                if(this.todos.length == 1) {
                  this.todos = [];
                } else {
                  this.getTodos();
                }
              },
              error =>  this.errorMessage = <any>error);
    }

    resetFilter(){
      this.filterValue = '';
    }
}
