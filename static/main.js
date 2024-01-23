import CS from './views/console/index.js'


new Vue({
    el: '#app',
    components: {'Config': CS},
    data() {
        return {
            menu: 'config'
        }
    }
})
