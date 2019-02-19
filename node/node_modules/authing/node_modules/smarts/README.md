# smarts
a smart library for doing smart things

## Installation

```bash
npm i --save smarts
```

### Node

```javascript
var smarts = require('smarts')(arguments)

// string arrays
smarts.optIn('foo', []) // false
smarts.optIn('foo', ['foo']) // true

// obj arrays
smarts.thingIn({ value: 'foo' }, []) // false
smarts.thingIn({ value: 'foo' }, [{ value: 'foo' }]) // true

// more examples to come.... 
```

### Vue

```javascript

<script>
    import smarts from 'smarts'
    export default {
        mixins: [
            smarts({
                vue: true, 
                objList: 'this.someListOfObjects', // set this if you don't want to always enter the most commonly checked list of objects in your vue component, it doesn't matter if the list has both strings and objects
                stringList: 'this.someListOfStrings' // set this if you don't want to always enter the most commonly checked list of strings in your vue component, it doesn't matter if the list has both strings and objects
            })
        ],
        data {
            someListOfObjects: [
                { value: 'foo' }
            ],
            someListOfStrings: [
                'foo'
            ],
        },
        created(){
            // string arrays
            this.optIn('foo', []) // false
            this.optIn('foo', ['foo']) // true
            this.optIn('foo') // true because of the default list set, useful for component specific logic
            
            // obj arrays
            this.thingIn({ value: 'foo' }, []) // false
            this.thingIn({ value: 'foo' }, [{ value: 'foo' }]) // true
            this.thingIn({ value: 'foo' }) // true because of the default list set, useful for component specific logic

            // more examples to come.... 
        }
    }
</script>
```