import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import {TodoDetailComponent} from "./todo-detail/todo-detail.component";
import {TodosComponent} from "./todos/todos.component";
import {TodoService} from "./todo/todo.service";
import {HTTP_PROVIDERS}    from 'angular2/http';
import {Todo} from './todo/todo'

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [
        ROUTER_PROVIDERS,
        HTTP_PROVIDERS,
        TodoService
    ]
})
@RouteConfig([
    {
        path: '/todos',
        name: 'Todos',
        component: TodosComponent,
        useAsDefault: true
    },
    {
        path: '/detail/:id',
        name: 'TodoDetail',
        component: TodoDetailComponent
    },
    {
        path: '/detail',
        name: 'NewTodo',
        component: TodoDetailComponent
    }

])
export class AppComponent {
    title = 'Todo List';
}
