import {Pipe} from 'angular2/core';

@Pipe({
  name: 'TodoPipe'
})
export class TodoPipe {
  transform(value, args?) {
    let [status] = args;
    return value.filter(todo => {
      if(status == '') {
        return todo;
      } else {
        return todo.status == status;
      }
    });
  }
}
