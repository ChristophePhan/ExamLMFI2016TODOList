import {Pipe} from 'angular2/core';

@Pipe({
  name: 'DatePipe'
})
export class DatePipe {
  transform(value, args?) {
    var date = new Date(value);
    var month =  (date.getMonth()<10?'0':'') + date.getMonth();
    var day =  (date.getDate()<10?'0':'') + date.getDate();
    var year = date.getFullYear();
    var hour = (date.getHours()<10?'0':'') + date.getHours();
    var min = (date.getMinutes()<10?'0':'') + date.getMinutes();
    var string = day +'/'+month+'/'+year+' '+hour+':'+min;
    return string;
  }
}
