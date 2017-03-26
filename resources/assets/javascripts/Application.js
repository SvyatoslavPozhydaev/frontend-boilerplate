import $ from 'jquery';

class Application{
    constructor(){
        console.log('application start');
        document.addEventListener('DOMContentLoaded', () => {
             console.log('application ready');
        })
    }
}

new Application();
